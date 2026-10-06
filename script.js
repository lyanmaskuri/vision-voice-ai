const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Audio and Speech Elements
const ttsToggle = document.getElementById('ttsToggle');
const chimeToggle = document.getElementById('chimeToggle');
const micToggle = document.getElementById('micToggle');
const targetObjectSelect = document.getElementById('targetObjectSelect');
const audioStatusPill = document.getElementById('audioStatusPill');
const audioNotification = document.getElementById('audioNotification');

// Speech-to-Text (Subtitles) Elements & State
const liveCaption = document.getElementById('liveCaption');
const micDot = document.getElementById('micDot');
const speechText = document.getElementById('speechText');

let recognition = null;
let isRecognizing = false;
let userWantsMic = true;
let captionFadeTimeout = null;

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function initSpeechRecognition() {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
        if (speechText) {
            speechText.innerText = 'Speech recognition not supported in this browser (Chrome/Edge recommended).';
        }
        return null;
    }

    if (recognition) return recognition;

    recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        isRecognizing = true;
        if (micDot) micDot.classList.add('recording');
        if (speechText && (!speechText.innerText || speechText.innerText.includes('Speak into'))) {
            speechText.innerText = 'Listening... Speak into your microphone';
        }
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        const currentText = (finalTranscript || interimTranscript).trim();
        if (currentText && speechText) {
            speechText.innerHTML = `<strong>You said:</strong> "${escapeHtml(currentText)}"`;
            if (liveCaption) liveCaption.classList.add('has-speech');

            clearTimeout(captionFadeTimeout);
            captionFadeTimeout = setTimeout(() => {
                if (liveCaption) liveCaption.classList.remove('has-speech');
            }, 6000);
        }
    };

    recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isRecognizing = false;
            userWantsMic = false;
            if (micToggle) micToggle.checked = false;
            if (speechText) speechText.innerText = 'Microphone permission blocked or denied.';
            if (micDot) micDot.classList.remove('recording');
        }
    };

    recognition.onend = () => {
        isRecognizing = false;
        if (micDot) micDot.classList.remove('recording');
        // If mic is still enabled by user, restart continuous recognition
        if (userWantsMic && micToggle && micToggle.checked) {
            try {
                recognition.start();
            } catch (e) {
                // Ignore if already starting
            }
        }
    };

    return recognition;
}

function startListening() {
    userWantsMic = true;
    const rec = initSpeechRecognition();
    if (rec && !isRecognizing) {
        try {
            rec.start();
        } catch (e) {
            console.warn('Recognition start error:', e);
        }
    }
}

function stopListening() {
    userWantsMic = false;
    if (recognition && isRecognizing) {
        try {
            recognition.stop();
        } catch (e) {}
    }
    if (micDot) micDot.classList.remove('recording');
    if (speechText) speechText.innerText = 'Microphone paused.';
}

if (micToggle) {
    micToggle.addEventListener('change', () => {
        if (micToggle.checked) {
            if (liveCaption) liveCaption.classList.add('active');
            startListening();
        } else {
            stopListening();
        }
    });
}

// Web Audio API Context (instantiated on user interaction)
let audioCtx = null;

function initAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Generate an alert chime using Web Audio API (sine wave frequency sweep)
function playAlertChime() {
    try {
        initAudioContext();
        if (!audioCtx) return;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Two-tone rising chime: 587.33Hz (D5) -> 880Hz (A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

        // Volume envelope: smooth attack & exponential decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.35);
    } catch (err) {
        console.warn('Audio chime error:', err);
    }
}

// Speak the detected object using the Web Speech API
function speakObject(objectName) {
    if (!('speechSynthesis' in window)) {
        console.warn('Web Speech API is not supported in this browser.');
        return;
    }

    // Cancel existing queued speech to prevent backlog
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`${objectName} detected`);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
    if (naturalVoice) {
        utterance.voice = naturalVoice;
    }

    window.speechSynthesis.speak(utterance);
}

// Display visual feedback for the audio alert
let noticeTimeout = null;
function showAudioNotice(message) {
    if (!audioNotification) return;

    audioNotification.innerText = message;
    audioNotification.classList.add('show');

    if (audioStatusPill) {
        audioStatusPill.innerText = 'Alert Fired';
        audioStatusPill.classList.add('active');
    }

    clearTimeout(noticeTimeout);
    noticeTimeout = setTimeout(() => {
        audioNotification.classList.remove('show');
        if (audioStatusPill) {
            audioStatusPill.innerText = 'Audio Active';
        }
    }, 2500);
}

// Smart cooldown tracking (prevents rapid-fire repeating while holding an object)
const lastAnnouncedTimes = new Map();
const COOLDOWN_MS = 4000; // 4 seconds cooldown per object class

function handleAnnouncements(predictions) {
    const isTtsActive = ttsToggle && ttsToggle.checked;
    const isChimeActive = chimeToggle && chimeToggle.checked;

    if (!isTtsActive && !isChimeActive) {
        return;
    }

    const selectedTarget = targetObjectSelect ? targetObjectSelect.value.toLowerCase() : 'all';
    const now = Date.now();

    for (let i = 0; i < predictions.length; i++) {
        if (predictions[i].score > 0.66) {
            const objectClass = predictions[i].class.toLowerCase();

            // Check if object matches target selection
            if (selectedTarget !== 'all' && objectClass !== selectedTarget) {
                continue;
            }

            // Check cooldown for this object class
            const lastTime = lastAnnouncedTimes.get(objectClass) || 0;
            if (now - lastTime >= COOLDOWN_MS) {
                lastAnnouncedTimes.set(objectClass, now);

                if (isChimeActive) {
                    playAlertChime();
                }

                if (isTtsActive) {
                    setTimeout(() => {
                        speakObject(predictions[i].class);
                    }, isChimeActive ? 150 : 0);
                }

                showAudioNotice(`🔊 ${predictions[i].class.toUpperCase()} detected (${Math.round(predictions[i].score * 100)}%)`);
                break; // Announce one object per frame
            }
        }
    }
}

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// If webcam supported, add event listener to button
if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}

// Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
        return;
    }

    // Initialize audio context on user click
    initAudioContext();
    if (audioStatusPill) {
        audioStatusPill.innerText = 'Audio Active';
    }

    // Activate live speech subtitles overlay
    if (liveCaption) {
        liveCaption.classList.add('active');
    }

    // Start speech recognition if microphone is enabled
    if (micToggle && micToggle.checked) {
        startListening();
    }

    // Hide the button once clicked.
    event.target.classList.add('removed');

    // getUsermedia parameters to force video but not audio.
    const constraints = {
        video: true
    };

    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
        video.srcObject = stream;
        video.addEventListener('loadeddata', predictWebcam);
    });
}

// Store the resulting model in the global scope of our app.
var model = undefined;

// Load the COCO-SSD model.
cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    // Show demo section now model is ready to use.
    demosSection.classList.remove('invisible');
    const notice = document.getElementById('modelStatusNotice');
    if (notice) {
        notice.style.display = 'none';
    }
});

var children = [];

function predictWebcam() {
    // Classify a frame in the stream.
    model.detect(video).then(function (predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            liveView.removeChild(children[i]);
        }
        children.splice(0);

        // Process audio alert and speech announcements
        handleAnnouncements(predictions);

        // Loop through predictions and draw them to the live view
        for (let n = 0; n < predictions.length; n++) {
            if (predictions[n].score > 0.66) {
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' - with '
                    + Math.round(parseFloat(predictions[n].score) * 100)
                    + '% confidence.';
                p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                    + (predictions[n].bbox[1] - 10) + 'px; width: '
                    + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                    + predictions[n].bbox[1] + 'px; width: '
                    + predictions[n].bbox[2] + 'px; height: '
                    + predictions[n].bbox[3] + 'px;';

                liveView.appendChild(highlighter);
                liveView.appendChild(p);
                children.push(highlighter);
                children.push(p);
            }
        }

        // Call this function again to keep predicting when the browser is ready.
        window.requestAnimationFrame(predictWebcam);
    });
}