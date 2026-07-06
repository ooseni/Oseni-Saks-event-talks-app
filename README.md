# BigQuery Release Radar 🚀

A premium, glassmorphic web application built with Python Flask and vanilla HTML/JS/CSS that fetches, parses, and displays Google Cloud BigQuery release notes. It includes a custom composition modal to easily broadcast key updates directly to X (Twitter), offline local storage caching, copy utilities, CSV exporting, and a dynamic Light/Dark mode.

---

## 🌟 Features

- **Live Atom Feed Integration**: Real-time parsing of the official Google Cloud BigQuery release notes feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- **Dynamic Light & Dark Theme**: Swaps the page's color scheme seamlessly between a neon glassmorphic dark mode and a high-contrast modern light mode, saving preferences in `localStorage`.
- **LocalStorage Offline Caching**: Automatically saves fetched release data. Renders cached content immediately on page reload to mask loading latency, and runs background fetches to update. Serves cached copy gracefully if offline.
- **Categorized Feed Parsing**: Automatically breaks down daily release updates into individual cards classified with color-coded badges:
  - 🟢 **Feature** (Emerald)
  - 🔵 **Change** (Blue)
  - 🟣 **Announcement** (Purple)
  - 🔴 **Breaking** (Red)
  - 🟡 **Issue** (Orange)
- **Live Search & Filters**: Search release logs instantly with a 200ms debounced input, and filter dynamically by category tags.
- **Result & Metadata Counters**: Shows result counter statistics (e.g., `Found 12 matching updates out of 50`) and a `Last checked: [Time]` timestamp to reassure data freshness.
- **Search Reset Shortcut**: Includes a quick clear button ("✕") inside the search field to reset filters instantly.
- **Copy to Clipboard Utility**: A copy button on every card copies text formatted as `[Date] Category: Content` with visual icon feedbacks.
- **Export to CSV**: Download the currently filtered list of release notes as a clean, standardized CSV file (`bigquery_releases_[category]_[date].csv`).
- **Interactive Tweet Composer**:
  - Click on any update to compose a tweet with prefilled emojis, categories, content text, and hashtags.
  - Features a circular SVG progress indicator tracking X's 280-character limit, transitioning alert levels (Green ➡️ Orange ➡️ Red).
  - Displays a red warning banner (`⚠️ Limit exceeded`) when typing beyond the limit.
  - Launches X's Web Intent API with one click.
- **Toast Notifications**: Interactive, non-intrusive global slide-in alerts (e.g., when copied to clipboard or during connection status changes).
- **Skeleton Loaders & Overflow Protections**: Elegant UI loading state placeholders and auto-scroll safeguards to wrap long tables/code segments on mobile viewports.

---

## 🛠️ Technology Stack

- **Backend**: Python, Flask, `feedparser`, `BeautifulSoup4`, `requests`
- **Frontend**: Vanilla HTML5, Vanilla CSS3 (Custom Variables, Flexbox, Keyframe Animations), Vanilla JavaScript (ES6)
- **Icons**: FontAwesome 6.4.0
- **Fonts**: Outfit (Headers) & Inter (Body) via Google Fonts

---

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ooseni/Oseni-Saks-event-talks-app.git
   cd Oseni-Saks-event-talks-app
   ```

2. **Set up a Virtual Environment**:
   ```bash
   python -m venv .venv
   ```

3. **Activate the Virtual Environment**:
   - **Windows (PowerShell)**:
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   - **Windows (CMD)**:
     ```cmd
     .venv\Scripts\activate.bat
     ```
   - **macOS / Linux**:
     ```bash
     source .venv/bin/activate
     ```

4. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. Run the Flask development server:
   ```bash
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://127.0.0.1:5000
   ```

---

## 📂 Project Structure

```
bq-releases-notes/
├── templates/
│   └── index.html      # UI structure, filters, compose modal, toasts container
├── static/
│   ├── app.js          # Controller state machine, localStorage, filters, modal, and theme toggling
│   └── style.css       # Variable stylesheets, glassmorphic layouts, light theme, & toast animations
├── app.py              # Flask server & XML parsing engine
├── requirements.txt    # Application dependencies
└── README.md           # Project documentation
```
