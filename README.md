# BigQuery Release Radar 🚀

A premium, glassmorphic web application built with Python Flask and vanilla HTML/JS/CSS that fetches, parses, and displays Google Cloud BigQuery release notes. It includes a custom composition modal to easily broadcast key updates directly to X (Twitter).

---

## 🌟 Features

- **Live Atom Feed Integration**: Real-time parsing of the official Google Cloud BigQuery release notes feed (`https://docs.cloud.google.com/feeds/bigquery-release-notes.xml`).
- **Modern UI/UX**: Premium dark mode design featuring smooth gradients, blur backdrops, and interactive card hover/selection states.
- **Categorized Feed Parsing**: Automatically breaks down dates into individual updates and classifies them with colored badges:
  - 🟢 **Feature** (Emerald)
  - 🔵 **Change** (Blue)
  - 🟣 **Announcement** (Purple)
  - 🔴 **Breaking** (Red)
  - 🟡 **Issue** (Orange)
- **Live Search & Filters**: Search through release contents instantly by keyword, or filter by specific update category.
- **Interactive Tweet Composer**:
  - Click on any update to compose a tweet about it.
  - Automatically formats the tweet with custom emojis, prefixes, and hashtags.
  - Includes a circular progress indicator for character limit tracking (X's 280-char limit) with real-time warning transitions (Green ➡️ Orange ➡️ Red).
  - One-click "Post to X" using X's Web Intent API.
- **Skeleton Loaders**: Provides elegant placeholder loaders during data fetches for a fluid user experience.

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
│   └── index.html      # UI structure, filters, compose modal
├── static/
│   ├── app.js          # State controller, filters, & Modal handlers
│   └── style.css       # Core styling & glassmorphic layouts
├── app.py              # Flask server & XML parsing engine
├── requirements.txt    # Application dependencies
└── README.md           # Documentation
```
