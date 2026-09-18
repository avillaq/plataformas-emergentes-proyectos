import { speakMessage } from "./sintesisVoz.js";

document.addEventListener('DOMContentLoaded', initD15);

function initD15() {
    const coordenadas = [
        64, 187, 
        143, 157, 
        226, 129, 
        290, 110, 
        361, 97, 
        433, 109, 
        508, 145, 
        568, 218, 
        589, 349, 
        560, 451, 
        504, 524, 
        442, 552, 
        376, 551, 
        296, 522, 
        229, 483, 
        164, 421
    ];

    const canvas = document.querySelector("#myCanvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const img = document.querySelector("#img-D15");

    function renderBaseCanvas() {
        if (!context || !img) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0);
    }

    if (img) {
        if (img.complete) {
            renderBaseCanvas();
        } else {
            img.onload = renderBaseCanvas;
        }
    }

    // Guardar estado inicial de colores para poder reiniciar
    const initialColors = {};
    for (let i = 1; i <= 32; i++) {
        const el = document.getElementById("elem" + i);
        if (el) {
            initialColors[i] = el.style.background;
        }
    }

    const btnVerResultados = document.querySelector("#btnVerResultados");
    const btnReset = document.querySelector("#btnResetD15");
    const diagnosisOutput = document.querySelector("#d15DiagnosisOutput");

    if (btnVerResultados) {
        btnVerResultados.addEventListener("click", evaluarD15);
    }

    if (btnReset) {
        btnReset.addEventListener("click", resetD15);
    }

    function resetD15() {
        for (let i = 1; i <= 32; i++) {
            const el = document.getElementById("elem" + i);
            if (el && initialColors[i]) {
                el.style.background = initialColors[i];
                el.style.border = (i >= 18 && initialColors[i] === "white") ? "2px dashed #94A3B8" : "2px solid transparent";
            }
        }
        renderBaseCanvas();
        if (diagnosisOutput) {
            diagnosisOutput.innerHTML = "";
            diagnosisOutput.style.display = "none";
        }
        elozo = null;
    }

    function evaluarD15() {
        const expected = [
            "rgb(53, 131, 180)",
            "rgb(59, 132, 167)",
            "rgb(57, 133, 156)",
            "rgb(59, 134, 144)",
            "rgb(63, 135, 130)",
            "rgb(88, 132, 115)",
            "rgb(108, 129, 100)",
            "rgb(131, 123, 93)",
            "rgb(144, 118, 96)",
            "rgb(158, 110, 111)",
            "rgb(159, 109, 124)",
            "rgb(156, 109, 137)",
            "rgb(146, 112, 153)",
            "rgb(143, 111, 164)",
            "rgb(128, 115, 178)"
        ];

        let errors = 15;
        renderBaseCanvas();

        context.beginPath();
        context.moveTo(coordenadas[0], coordenadas[1]);

        for (let j = 0; j < 15; j++) {
            const num = 18 + j;
            const targetEl = document.getElementById("elem" + num);
            if (!targetEl) continue;

            const currentBg = targetEl.style.background;
            for (let i = 0; i < 15; i++) {
                if (currentBg === expected[i]) {
                    if (num === 18 + i) {
                        errors--;
                    }
                    context.lineTo(coordenadas[2 * i + 2], coordenadas[2 * i + 3]);
                }
            }
        }

        context.lineWidth = 3;
        context.strokeStyle = "#1E3A8A"; // Azul clínico de alto contraste
        context.stroke();

        let diagnosis = "";
        let diagnosisClass = "normal";

        if (errors > 2) {
            diagnosis = "El diagnóstico sugiere: Posible discromatopsia o daltonismo. Se observan cruces en el diagrama polar de Farnsworth.";
            diagnosisClass = "error";
        } else if (errors === 2) {
            diagnosis = "El diagnóstico sugiere: Visión de color normal con errores menores de trasposición.";
            diagnosisClass = "warning";
        } else {
            diagnosis = "El diagnóstico es: Resultado normal. Trayectoria circular uniforme sin cruces.";
            diagnosisClass = "success";
        }

        if (diagnosisOutput) {
            diagnosisOutput.style.display = "block";
            diagnosisOutput.className = `containerResult diagnosis-${diagnosisClass}`;
            diagnosisOutput.innerHTML = `
                <h2>Resultado del Test Farnsworth D-15</h2>
                <p><strong>Discrepancias detectadas:</strong> ${errors} pastilla(s)</p>
                <p>${diagnosis}</p>
            `;
        }

        speakMessage(diagnosis);
    }

    const colorBoxes = document.querySelectorAll("div[data='colorBox']");
    let elozo = null;

    colorBoxes.forEach(colorBox => {
        colorBox.addEventListener("click", function () {
            const k = colorBox.getAttribute("value");

            if (elozo !== null && k !== elozo) {
                const elozoEl = document.getElementById("elem" + elozo);
                if (elozoEl) {
                    // Si el elemento destino es blanco (slot vacío) y el seleccionado tiene color
                    if (colorBox.style.background === "white" && elozoEl.style.background !== "white") {
                        colorBox.style.background = elozoEl.style.background;
                        elozoEl.style.background = "white";
                        elozoEl.style.border = "2px dashed #94A3B8";
                    } 
                    // Si ambos tienen color, permitir intercambio
                    else if (colorBox.style.background !== "white" && elozoEl.style.background !== "white") {
                        const tempBg = colorBox.style.background;
                        colorBox.style.background = elozoEl.style.background;
                        elozoEl.style.background = tempBg;
                    }

                    elozoEl.style.boxShadow = "none";
                }
                elozo = null;
                colorBox.style.boxShadow = "none";
                return;
            }

            if (elozo === k) {
                colorBox.style.boxShadow = "none";
                elozo = null;
                return;
            }

            // Seleccionar pastilla
            elozo = k;
            colorBox.style.boxShadow = "0 0 0 3px #1E3A8A, 0 4px 10px rgba(0,0,0,0.2)";
        });
    });
}
