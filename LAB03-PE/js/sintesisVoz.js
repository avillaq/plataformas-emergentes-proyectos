// Módulo de Síntesis de Voz (TTS) Optimizada en Español
let spanishVoice = null;

function loadVoices() {
    if (!('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    // Prioridades de voz en español natural
    const preferredNames = [
        "Microsoft Catalina",
        "Microsoft Helena",
        "Microsoft Laura",
        "Google español",
        "Paulina",
        "Monica",
        "Jorge"
    ];

    // Intentar coincidir por nombre preferido
    for (const name of preferredNames) {
        const found = voices.find(v => v.name.includes(name));
        if (found) {
            spanishVoice = found;
            return;
        }
    }

    // Si no, buscar cualquier voz en español
    spanishVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('es')) || null;
}

if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
}

export function speakMessage(message) {
    if (!('speechSynthesis' in window) || !message) return;

    try {
        window.speechSynthesis.cancel(); // Detener locución previa

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = "es-ES";
        utterance.pitch = 1.1;
        utterance.rate = 1.05;

        if (!spanishVoice) {
            loadVoices();
        }
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        utterance.onstart = () => {
            document.dispatchEvent(new CustomEvent('assistant-speech-start', { detail: { text: message } }));
        };

        utterance.onend = () => {
            document.dispatchEvent(new CustomEvent('assistant-speech-end'));
        };

        utterance.onerror = (e) => {
            console.warn("SpeechSynthesis error:", e);
            document.dispatchEvent(new CustomEvent('assistant-speech-end'));
        };

        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.warn("Error en speakMessage:", err);
    }
}

export function stopSpeaking() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        document.dispatchEvent(new CustomEvent('assistant-speech-end'));
    }
}
