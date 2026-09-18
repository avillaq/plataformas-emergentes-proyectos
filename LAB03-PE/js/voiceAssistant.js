import { Artyom } from './artyom.window.min.js';
import { speakMessage, stopSpeaking } from './sintesisVoz.js';

let artyomInstance = null;

document.addEventListener('DOMContentLoaded', initVoiceAssistant);

function initVoiceAssistant() {
    const btnOnOff = document.querySelector('#onOffAssistant');
    const assistantStatus = sessionStorage.getItem('assistantStatus') || 'off';

    // Inyectar Modal de Ayuda por Voz si no existe
    injectVoiceModal();

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Este navegador no soporta Speech Recognition API (se requiere Chrome/Edge para voz continua).');
        if (btnOnOff) {
            btnOnOff.title = 'Reconocimiento de voz no soportado en este navegador';
            btnOnOff.style.opacity = '0.5';
        }
        return;
    }

    artyomInstance = new Artyom();

    // Redirigir texto reconocido para actualizar el modal en tiempo real
    artyomInstance.redirectRecognizedTextOutput((text, isFinal) => {
        updateLiveTranscript(text, isFinal);
    });

    if (btnOnOff) {
        if (assistantStatus === 'on') {
            setAssistantUI(true);
            startContinuousArtyom();
        } else {
            setAssistantUI(false);
        }

        btnOnOff.addEventListener('click', function (e) {
            e.preventDefault();
            const currentState = btnOnOff.getAttribute('state') || 'off';
            if (currentState === 'on') {
                stopArtyom();
                setAssistantUI(false);
                sessionStorage.setItem('assistantStatus', 'off');
                speakMessage('Asistente desactivado.');
            } else {
                setAssistantUI(true);
                sessionStorage.setItem('assistantStatus', 'on');
                startContinuousArtyom();
                speakMessage('¡Hola! Asistente activo. Di "ayuda" para escuchar los comandos.');
            }
        });
    }

    // Escuchar eventos de habla para animar ondas
    document.addEventListener('assistant-speech-start', (e) => {
        const waves = document.querySelectorAll('.voice-wave-bar');
        waves.forEach(w => w.classList.add('active'));
        const robotSpeechText = document.querySelector('#robotSpeechText');
        if (robotSpeechText && e.detail && e.detail.text) {
            robotSpeechText.textContent = `«${e.detail.text}»`;
        }
    });

    document.addEventListener('assistant-speech-end', () => {
        const waves = document.querySelectorAll('.voice-wave-bar');
        waves.forEach(w => w.classList.remove('active'));
    });

    // Soporte táctil para menús desplegables en dispositivos móviles
    document.querySelectorAll('.dropdown').forEach(dd => {
        const trigger = dd.querySelector(':scope > a');
        if (trigger) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const isOpen = dd.classList.contains('open');
                document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
                if (!isOpen) {
                    dd.classList.add('open');
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
        }
    });
}

function setAssistantUI(isOn) {
    const btnOnOff = document.querySelector('#onOffAssistant');
    const badge = document.querySelector('#voiceStateBadge');
    if (btnOnOff) {
        btnOnOff.setAttribute('state', isOn ? 'on' : 'off');
        btnOnOff.src = isOn ? 'img/robotOn.png' : 'img/robotOff.png';
        btnOnOff.classList.toggle('robot-active', isOn);
    }
    if (badge) {
        badge.textContent = isOn ? 'Escuchando' : 'Inactivo';
        badge.className = isOn ? 'badge-status badge-active' : 'badge-status badge-idle';
    }
}

function startContinuousArtyom() {
    if (!artyomInstance) return;

    artyomInstance.initialize({
        lang: 'es-ES',
        debug: false,
        listen: true,
        continuous: true,
        soundex: true
    }).then(() => {
        registerAllCommands();
    }).catch(err => {
        console.warn("No se pudo iniciar Artyom:", err);
    });
}

function stopArtyom() {
    if (artyomInstance) {
        artyomInstance.fatality().catch(() => {});
    }
    stopSpeaking();
}

function registerAllCommands() {
    if (!artyomInstance) return;
    artyomInstance.emptyCommands();

    const filename = window.location.pathname.split('/').pop() || 'index.html';

    // Comandos Globales
    artyomInstance.addCommands([
        {
            indexes: ['saludo', 'hola', 'buenos días', 'buenas tardes'],
            action: () => speakMessage('¡Hola! Estoy listo para ayudarte con tu test de daltonismo.')
        },
        {
            indexes: ['apágate', 'apagar asistente', 'desactivar voz', 'silencio'],
            action: () => {
                const btnOnOff = document.querySelector('#onOffAssistant');
                if (btnOnOff) btnOnOff.click();
            }
        },
        {
            indexes: ['ayuda', 'mostrar ayuda', 'abrir ayuda', 'comandos', 'ver comandos'],
            action: () => {
                openVoiceModal();
                speakMessage('Aquí tienes la lista de comandos por voz.');
            }
        },
        {
            indexes: ['cerrar ayuda', 'ocultar ayuda', 'cerrar modal', 'entendido'],
            action: () => closeVoiceModal()
        },
        {
            indexes: ['ir al inicio', 'página principal', 'volver al inicio', 'menú principal', 'inicio'],
            action: () => { window.location.href = 'index.html'; }
        },
        {
            smart: true,
            indexes: [
                'ir al test de niños *',
                'ir a la prueba de niños *',
                'test niños *',
                'niños *'
            ],
            action: (i, wildcard) => {
                const w = wildcard.toLowerCase();
                if (w.includes('1') || w.includes('uno') || w.includes('primero')) {
                    window.location.href = 'test-ninos-1.html';
                } else if (w.includes('2') || w.includes('dos') || w.includes('segundo')) {
                    window.location.href = 'test-ninos-2.html';
                } else if (w.includes('3') || w.includes('tres') || w.includes('tercero')) {
                    window.location.href = 'test-ninos-3.html';
                }
            }
        },
        {
            smart: true,
            indexes: [
                'ir al test de adultos *',
                'ir a la prueba de adultos *',
                'test adultos *',
                'adultos *'
            ],
            action: (i, wildcard) => {
                const w = wildcard.toLowerCase();
                if (w.includes('1') || w.includes('uno') || w.includes('primero')) {
                    window.location.href = 'test-Adultos-1.html';
                } else if (w.includes('2') || w.includes('dos') || w.includes('segundo')) {
                    window.location.href = 'test-Adultos-2.html';
                }
            }
        }
    ]);

    // Comandos específicos para Test Niños 1 (Números)
    if (filename.includes('test-ninos-1')) {
        artyomInstance.addCommands([
            {
                smart: true,
                indexes: ['es el *', 'número *', 'veo el *', 'opción *'],
                action: (i, wildcard) => {
                    const cards = document.querySelectorAll('.numberCards .card');
                    const numSpoken = wildcard.replace(/[^0-9]/g, '');
                    cards.forEach(c => {
                        if (c.textContent.trim() === numSpoken || c.textContent.trim() === wildcard.trim()) {
                            c.click();
                        }
                    });
                }
            },
            {
                indexes: ['no veo nada', 'no veo ningún número', 'no sé'],
                action: () => {
                    const noSee = document.querySelector('#btnNoSeeKids');
                    if (noSee) noSee.click();
                }
            }
        ]);
    }

    // Comandos específicos para Test Niños 2 (Animales)
    if (filename.includes('test-ninos-2')) {
        artyomInstance.addCommands([
            {
                smart: true,
                indexes: ['es el animal *', 'opción *', 'elijo la opción *'],
                action: (i, wildcard) => {
                    const num = wildcard.replace(/[^0-9]/g, '');
                    const input = document.querySelector(`input[name="animals"][value="${num}"]`);
                    if (input) {
                        input.checked = true;
                        input.dispatchEvent(new Event('change'));
                    }
                }
            },
            {
                indexes: ['siguiente', 'siguiente animal', 'continuar'],
                action: () => {
                    const btn = document.querySelector('#btn-siguiente');
                    if (btn) btn.click();
                }
            }
        ]);
    }

    // Comandos específicos para Test Niños 3 (Ocultos con Checkbox)
    if (filename.includes('test-ninos-3')) {
        artyomInstance.addCommands([
            {
                smart: true,
                indexes: ['selecciona el *', 'marca el *', 'veo un *', 'veo una *'],
                action: (i, wildcard) => {
                    const clean = wildcard.toLowerCase().trim();
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(cb => {
                        if (clean.includes(cb.value.toLowerCase())) {
                            cb.checked = true;
                            cb.dispatchEvent(new Event('change'));
                        }
                    });
                }
            },
            {
                indexes: ['ver solución', 'mostrar solución', 'solución'],
                action: () => {
                    const btn = document.querySelector('#btnVerSolucionVolver');
                    if (btn && btn.textContent.includes('solucion')) btn.click();
                }
            },
            {
                indexes: ['volver', 'regresar', 'ocultar solución'],
                action: () => {
                    const btn = document.querySelector('#btnVerSolucionVolver');
                    if (btn && btn.textContent.includes('Volver')) btn.click();
                }
            }
        ]);
    }

    // Comandos específicos para Test Adultos 1 (Ishihara 38)
    if (filename.includes('test-Adultos-1')) {
        artyomInstance.addCommands([
            {
                smart: true,
                indexes: ['escribe el *', 'escribe *', 'digita *', 'número *', 'es el *'],
                action: (i, wildcard) => {
                    const digits = wildcard.replace(/[^0-9]/g, '');
                    if (digits.length > 0) {
                        digits.split('').forEach(d => {
                            const keyBtn = Array.from(document.querySelectorAll('.keyboardKey')).find(k => k.textContent.trim() === d);
                            if (keyBtn) keyBtn.click();
                        });
                    }
                }
            },
            {
                indexes: ['siguiente', 'siguiente lámina', 'confirmar', 'listo'],
                action: () => {
                    const btn = document.querySelector('#checkButton');
                    if (btn) btn.click();
                }
            },
            {
                indexes: ['borrar', 'borra los números', 'limpiar', 'borrar todo'],
                action: () => {
                    const btn = document.querySelector('#clearButton');
                    if (btn) btn.click();
                }
            },
            {
                indexes: ['no veo nada', 'no veo el número', 'no distingo', 'no veo'],
                action: () => {
                    const btn = document.querySelector('#noSeeButton');
                    if (btn) btn.click();
                }
            },
            {
                indexes: ['volver a jugar', 'reiniciar test', 'repetir prueba'],
                action: () => {
                    const btn = document.querySelector('#btnResult');
                    if (btn) btn.click();
                }
            }
        ]);
    }

    // Comandos específicos para Test Adultos 2 (Farnsworth D-15)
    if (filename.includes('test-Adultos-2')) {
        artyomInstance.addCommands([
            {
                indexes: ['ver resultados', 'evaluar', 'terminar', 'calcular'],
                action: () => {
                    const btn = document.querySelector('#btnVerResultados');
                    if (btn) btn.click();
                }
            },
            {
                indexes: ['reiniciar', 'limpiar bandeja', 'deshacer todo'],
                action: () => {
                    const btn = document.querySelector('#btnResetD15');
                    if (btn) btn.click();
                }
            }
        ]);
    }
}

function updateLiveTranscript(text, isFinal) {
    const liveTextEl = document.querySelector('#liveTranscriptText');
    if (liveTextEl && text) {
        liveTextEl.textContent = `«${text}»` + (isFinal ? ' ✔' : ' ...');
    }
}

function injectVoiceModal() {
    if (document.querySelector('#voiceModalOverlay')) return;

    const modalHTML = `
    <div id="voiceModalOverlay" class="voice-modal-overlay" style="display: none;">
        <div class="voice-modal-card">
            <div class="voice-modal-header">
                <div class="modal-title-group">
                    <span class="voice-pulse-dot"></span>
                    <h3 class="modal-title">Asistente de Voz — Guía Rápida</h3>
                </div>
                <button type="button" class="voice-modal-close" id="voiceModalCloseBtn" aria-label="Cerrar modal">&times;</button>
            </div>
            
            <div class="voice-live-strip">
                <div class="voice-wave-container">
                    <span class="voice-wave-bar"></span>
                    <span class="voice-wave-bar"></span>
                    <span class="voice-wave-bar"></span>
                    <span class="voice-wave-bar"></span>
                </div>
                <div class="voice-live-content">
                    <div class="voice-live-label">Transcripción en vivo:</div>
                    <div class="voice-live-text" id="liveTranscriptText">Esperando tu voz... Di un comando o número.</div>
                </div>
            </div>

            <div class="voice-robot-msg" id="robotSpeechWrap">
                <span class="robot-label">Respuesta del asistente:</span>
                <span id="robotSpeechText">«Activa el micrófono en la cabecera para comenzar a hablar.»</span>
            </div>

            <div class="voice-commands-grid">
                <div class="cmd-category">
                    <h4>Navegación</h4>
                    <ul>
                        <li><code>"Ir al inicio"</code></li>
                        <li><code>"Test niños 1 / 2 / 3"</code></li>
                        <li><code>"Test adultos 1 / 2"</code></li>
                    </ul>
                </div>
                <div class="cmd-category">
                    <h4>Respuestas en Tests</h4>
                    <ul>
                        <li><code>"Escribe setenta y cuatro"</code></li>
                        <li><code>"Siguiente"</code> / <code>"No veo"</code></li>
                        <li><code>"Borrar"</code> / <code>"Ver solución"</code></li>
                    </ul>
                </div>
                <div class="cmd-category">
                    <h4>Control de Voz</h4>
                    <ul>
                        <li><code>"Ayuda"</code> / <code>"Cerrar ayuda"</code></li>
                        <li><code>"Silencio"</code> / <code>"Apágate"</code></li>
                        <li><code>"Volver a jugar"</code></li>
                    </ul>
                </div>
            </div>

            <div class="voice-modal-footer">
                <span class="voice-note">Soporte nativo en Google Chrome y Microsoft Edge (Español es-ES).</span>
                <button type="button" class="btn-voice-dismiss" id="voiceModalDismissBtn">Entendido</button>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.querySelector('#voiceModalCloseBtn')?.addEventListener('click', closeVoiceModal);
    document.querySelector('#voiceModalDismissBtn')?.addEventListener('click', closeVoiceModal);
    document.querySelector('#voiceModalOverlay')?.addEventListener('click', (e) => {
        if (e.target.id === 'voiceModalOverlay') closeVoiceModal();
    });
}

export function openVoiceModal() {
    const overlay = document.querySelector('#voiceModalOverlay');
    if (overlay) overlay.style.display = 'flex';
}

export function closeVoiceModal() {
    const overlay = document.querySelector('#voiceModalOverlay');
    if (overlay) overlay.style.display = 'none';
}

window.openVoiceModal = openVoiceModal;
window.closeVoiceModal = closeVoiceModal;
