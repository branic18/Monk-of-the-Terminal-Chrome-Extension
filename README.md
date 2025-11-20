# **🧊 Monk of the Terminal — Chrome Extension (Pomodoro + AI Future Twin)**

*A cyberpunk, privacy-first focus tracker designed to evolve with you.*

---

## **📌 Overview**

**Monk of the Terminal** is a Chrome extension that transforms focus practice into an adaptive, AI-powered progression system.
It tracks your real behavior—tab switching, session consistency, and digital discipline—and generates evolving insights from a persona called **The Future Twin**, a predictive model of who you’re becoming.

Everything runs **locally**, with optional AI features routed through a **privacy-first server proxy**. No user data is synced or stored externally.

This project demos:

* Real-world Chrome extension engineering
* Background timers using service workers
* Badge-based dynamic countdowns
* Notification button actions (start break / continue)
* Local storage behavior modeling
* Adaptive AI prompting based on user history
* A cyberpunk-monastic UX that feels alive

---

## **🎯 Core Features**

### **1. Pomodoro Engine (Background Timer)**

* 25-minute focus sessions
* 5-minute regenerative breaks
* Skip button that transitions intelligently
* Badge countdown (“23m”, “12m”, etc.)
* Audio + (Future Scope) Chrome notification when a session ends
* (Future Scope) Notification buttons that trigger:

  * **Take a Break**
  * **Continue Working**

### **2. The Three Monk Stats**

Each session affects deeper traits that represent your digital discipline:

**🧘 STILLNESS**

* Low tab switching
* Long uninterrupted stretches
* Clean closures at day’s end

**🧩 DISCIPLINE**

* Complete full 25-minute work sessions
* Take breaks at the correct interval
* Maintain a steady work–break cadence

**📐 ORDER**

* Low tab count
* Predictable start/end times
* Reduced digital chaos

Stats update automatically based on behavior.

---

## **🔮 AI Future Twin (Work In Progress)**

The Future Twin is a predictive companion that evolves with you.
Using only locally stored past outputs, the AI generates:

### **✓ Predictive behavior forecasts**

* Tomorrow’s focus likelihood
* 7-day consistency projections
* Burnout risk signals

### **✓ Session recaps**

* When focus spiked or dipped
* Where wandering occurred
* Patterns only an AI could spot

### **✓ Persona evolution**

* CALM → FOCUSED → ASCENDANT → TRANSCENDENT

### **✓ A message from “Future You”**

Atmospheric cyberpunk-monk reflections grounded in your real data.

All past predictions are stored in `chrome.storage.local`, ensuring the persona evolves over time.

---

## **🔐 Privacy-First Architecture**

**No external analytics.
No hidden sync.
No user identifiers.**

* Behavioral stats are stored in `chrome.storage.local` only.
* AI requests are **proxied** through a lightweight server to protect API keys.
* You can run offline: the core Pomodoro engine works without AI.

---

## **🛠 Tech Stack**

* **Chrome Extension (Manifest V3)**
* **JavaScript ES Modules**
* **Service Worker background timer**
* **chrome.alarms, chrome.notifications, chrome.storage**
* **Local storage for user history**
* **(Work in Progress) Node/Express proxy for AI calls**

---

## **📂 File Structure**

```
/extension
  ├── manifest.json
  ├── popup.html
  ├── popup.js
  ├── background.js
  ├── styles.css
  ├── assets/
  │    ├── icon.png
  │    └── gong-sound-effect.mp3
  └── README.md

/server-proxy (work in progress)
  ├── index.js
  └── package.json
```

---

## **🚀 How It Works**

### **Starting a session**

1. User clicks **Begin Focus**
2. Background timer starts
3. Badge displays “25m”, “24m”, …
4. Popup reflects real-time countdown

### **Session End**

* Audio plays
* (Future scope) Chrome notifies: “Session Complete — Continue or Break?”
* (Future scope) Button click triggers next session type

### **Future Twin Integration**

Each session saves:

* stats
* session metadata
* previous AI output

Then the proxy sends a prompt with:

* current session stats
* previous Future Twin message
* longitudinal behavior trends

The AI returns:

* a new prediction
* an evolution stage
* a timeline insight
* a message from Future You

Stored locally for continuity.

---

## **🧪 Example Future Twin Output**

> “Your precision rose today—fewer resets, fewer domain hops.
> If you continue at this pace, your 7-day consistency arc rises to 78%.
> Burnout risk remains low but trending upward after dusk sessions.
> You’re approaching **FOCUSED FORM**. Stay the path.”

---

## **📸 Demo / Recording**

Coming soon: Loom walkthrough + extension build link.

---

## **⚙️ Installation (Dev Mode)**

1. Clone repository
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load Unpacked**
5. Select `/extension` folder

---

## **💡 Why This Project Matters**

This extension is a **demonstration of applied AI engineering**:

* Background service worker logic
* (Future scope) Real notifications with action buttons
* Data modeling for behavior patterns
* Adaptive AI persona that evolves via local history
* Privacy-first design
* A cohesive aesthetic and narrative

---

## **📬 Contact / Notes**

Feel free to fork, remix, or extend.
This project is intentionally minimal and open-ended.
