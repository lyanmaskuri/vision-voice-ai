# VisionVoice AI — Smart Vision & Voice Assistant

[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech-API-4285F4?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-00C853?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

> **VisionVoice AI** is an in-browser multimodal AI application that performs real-time edge computer vision using TensorFlow.js with zero server overhead. It pairs live visual object detection with bidirectional speech interaction, generating real-time subtitles as you speak and voice announcements with audio chimes when objects appear.

---

## ✨ Features

- 👁️ **On-Device Real-Time Object Detection**:
  - Powered by the pre-trained **COCO-SSD** model running directly on client hardware via **WebGL acceleration**.
  - Detects up to 80 common object categories (people, phones, laptops, cups, bottles, etc.) at 30+ FPS.
- 🎙️ **Live Speech-to-Text (STT) Subtitles**:
  - Transcribes your spoken voice into real-time on-screen subtitles overlaid on the camera feed using the native `SpeechRecognition` API.
  - Displays interim words dynamically as you speak, with an animated pulsing microphone indicator.
- 🔊 **Text-to-Speech (TTS) Voice Announcements**:
  - Automatically speaks announcements (e.g., *"Cell phone detected"*) using the browser's native `SpeechSynthesis` engine.
- 🔔 **Synthesized Alert Chimes**:
  - Custom two-tone pitch sweep synthesized via the **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`) requiring **zero external audio files**.
- ⏱️ **Smart Cooldown & Debounce Engine**:
  - Throttles alerts to prevent audio stutter or queue backlogs when objects remain in view.
- 🎯 **Target Object Filter**:
  - Focus alerts exclusively on a chosen item (e.g., only alert when a *Cell Phone* or *Person* enters the frame) or monitor all detected objects.
- 🖥️ **Side-by-Side Dashboard Layout**:
  - Clean, responsive dashboard layout pairing the 640×480 live stream with a dedicated audio & telemetry control panel.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Machine Learning** | [TensorFlow.js](https://www.tensorflow.org/js) (`@tensorflow/tfjs`, `coco-ssd`) | Edge neural network inference via WebGL |
| **Speech Recognition** | Web Speech API (`SpeechRecognition`) | Real-time speech-to-text live subtitles |
| **Speech Synthesis** | Web Speech API (`speechSynthesis`) | Spoken object detection announcements |
| **Audio Synthesis** | Web Audio API (`AudioContext`) | Zero-asset synthetic notification chimes |
| **Camera & Video** | MediaDevices API (`getUserMedia`) | Low-latency local webcam streaming |
| **Frontend UI** | HTML5, CSS3 (Flexbox, Glassmorphism) | Responsive dual-column dashboard interface |

---

## 🚀 Getting Started

### Prerequisites
* A modern web browser with camera and microphone support (**Google Chrome** or **Microsoft Edge** is recommended for full Web Speech API support).
* A working webcam and microphone.

### Running Locally

You can run this project locally without any installation or build tools:

#### Option 1: Direct File (Double-click)
1. Double-click [`index.html`](index.html) to open it in your browser.
2. Click **"Enable Webcam"** and grant camera & microphone permissions.

#### Option 2: Local HTTP Server (Recommended)
Running via a local HTTP server ensures smooth audio context initialization:

**Using Python:**
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

**Using Node.js (`npx serve` or `http-server`):**
```bash
npx serve .
```

**Using VS Code:**
* Right-click [`index.html`](index.html) and select **"Open with Live Server"**.

---

## 🌐 Free Deployment (GitHub Pages)

To showcase this on your live portfolio:

1. Push this repository to GitHub.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Branch**, select `main` (or `master`) and folder `/ (root)`.
4. Click **Save**. Your project will be live at `https://<your-username>.github.io/<repo-name>/`!

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
