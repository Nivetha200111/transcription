# தொல்நோக்கு (Tholnokku)
### AI-Powered Ancient Tamil Manuscript Restorer & Epigraphist

**Tholnokku** (roughly translating to "Ancient Vision" or "Archaeological Perspective") is a specialized digital heritage application designed to preserve, restore, and decipher ancient Tamil palm-leaf manuscripts (*Olai Chuvadi*). 

It bridges the gap between centuries-old wisdom and modern technology using advanced Multimodal LLMs and generative art.

---

## 🏛️ Mission
Millions of palm-leaf manuscripts containing medical knowledge (Siddha), astronomy, literature, and philosophy are deteriorating in private collections and temples. Tholnokku aims to democratize the preservation process by providing a tool that acts as both a **Master Conservator** (repairing the image) and an **Expert Epigraphist** (reading the script).

---

## ✨ Key Features

### 1. Digital Restoration (Gemini 2.5 Flash Image)
*   **Damage Repair**: Removes cracks, wormholes, and water stains from scans.
*   **Ink Enhancement**: significantly increases the contrast of faded stylus etchings using "Master Archivist" prompts.
*   **Predictive Inpainting**: Uses context-aware AI to reconstruct missing character strokes where the leaf edges are broken.
*   **Interactive Comparison**: Features a "Before/After" slider to verify authenticity.

### 2. Scholarly Analysis (Gemini 3 Pro + Thinking Mode)
*   **Paleography**: Distinguishes between intentional script and leaf grain.
*   **Transcription**: Converts archaic scripts (Vatteluttu, Grantha, Early Tamil) into standard Modern Tamil.
*   **Translation**: Provides formal academic English translations.
*   **Source Identification**: Deterministically identifies the literary work (e.g., *Kamba Ramayanam*, *Thirukkural*) and specific verse numbers.
*   **Geo-Location**: Estimates the region of origin (e.g., "Thanjavur Maratha Court") and maps it using Google Maps Grounding.

### 3. Generative Cultural UI
*   **Procedural Kolams**: No static images. All borders and motifs are **Sikku/Neli Kolams** (Curved Knots) generated mathematically in real-time using Bezier curves.
*   **Flickering Diya**: A CSS-animated realistic clay lamp (Agal Vilakku) that responds to simulated wind drafts.
*   **Heritage Theme**: A custom design system built on deep earth tones and temple gold.

### 4. Local Archive (IndexedDB)
*   All processed manuscripts are stored locally in the user's browser via IndexedDB.
*   Users can build a personal digital library of restored works without data leaving their device after processing.

---

## 🛠️ Technical Architecture

### Design System (TailwindCSS)
The app utilizes a bespoke Tailwind configuration defined in `index.html`:
*   **Palette**: 
    *   `heritage-*`: Deep browns and sepias (`#0f0502` to `#2a1205`) mimicking aged wood and treated palm leaves.
    *   `royal-*`: Muted ambers and golds (`#fbbf24`, `#d97706`) inspired by temple jewelry.
    *   `parchment-*`: Off-whites (`#fef3c7`) for high-contrast reading without eye strain.
*   **Typography**: 
    *   *Noto Serif Tamil*: Handles complex vertical stacking of Tamil ligatures.
    *   *Crimson Pro*: Evokes the feel of academic journals.

### AI Pipeline (`services/geminiService.ts`)
1.  **Restoration**: 
    *   Model: `gemini-2.5-flash-image`
    *   Strategy: Direct pixel-level image-to-image transformation instructions.
2.  **Analysis**: 
    *   Model: `gemini-3-pro-preview`
    *   Config: `thinkingBudget: 32768` (Max) for deep reasoning on obscure grammar. `temperature: 0.0` for deterministic source citation.
3.  **Grounding**:
    *   Model: `gemini-2.5-flash` (Tools)
    *   Tool: `googleMaps` for verifying geographic locations mentioned in the text.

### Generative Art (`utils/kolamGenerator.ts`)
The application generates SVG paths dynamically:
*   **Sikku Borders**: Calculates control points to weave a continuous line around a grid of dots, creating the traditional "Endless Knot" pattern.
*   **Diya Path**: Draws a stylized lamp silhouette using quadratic curves.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js installed.
*   A valid **Google Gemini API Key** with access to `gemini-3-pro-preview` and `gemini-2.5-flash-image`.

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/tholnokku.git
    cd tholnokku
    ```

2.  **Environment Setup**:
    Ensure your environment provides `process.env.API_KEY` to the application.

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Run the App**:
    ```bash
    npm start
    ```

---

## 📂 Project Structure

```
/
├── components/
│   ├── AnimatedKolam.tsx   # Renders procedural SVG paths (Borders & Motifs)
│   ├── FlickeringDiya.tsx  # CSS-animated realistic lamp component
│   ├── Header.tsx          # Main application header with gradients
│   ├── HistoryGallery.tsx  # Grid view of stored manuscripts
│   ├── ImageUploader.tsx   # "Ceremonial" upload interface
│   └── ResultsDisplay.tsx  # Main workspace (Restoration, Transcription, Map)
├── services/
│   ├── dbService.ts        # IndexedDB wrapper for local storage
│   └── geminiService.ts    # Google GenAI SDK integration
├── utils/
│   └── kolamGenerator.ts   # Math logic for Bezier curve Kolam generation
├── App.tsx                 # Main layout and state management
├── index.html              # Tailwind config and global styles
└── types.ts                # TypeScript interfaces
```

---

## 📜 License
MIT License. Created for the preservation of Tamil Heritage.
