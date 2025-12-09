import { ManuscriptRecord } from '../types';

const DB_NAME = 'PalmLeafDB';
const STORE_NAME = 'manuscripts';
const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject("IndexedDB is not supported in this browser.");
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject("Database error: " + (event.target as IDBOpenDBRequest).error);

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveManuscript = async (record: Omit<ManuscriptRecord, 'id'>): Promise<number> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(record);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to save to DB:", error);
    throw error;
  }
};

export const getAllManuscripts = async (): Promise<ManuscriptRecord[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
          const results = request.result as ManuscriptRecord[];
          // Sort by timestamp descending (newest first)
          resolve(results.sort((a, b) => b.timestamp - a.timestamp));
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to fetch from DB:", error);
    return [];
  }
};

export const deleteManuscript = async (id: number): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to delete from DB:", error);
    throw error;
  }
};