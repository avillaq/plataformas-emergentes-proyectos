import { speakMessage } from "./sintesisVoz.js";

document.addEventListener("DOMContentLoaded", function () {
    const images = [
        { number: 12, image: "imagenes/test-ninos-1/12.jpg" },
        { number: 8, image: "imagenes/test-ninos-1/8.jpg" },
        { number: 6, image: "imagenes/test-ninos-1/6.jpg" },
        { number: 29, image: "imagenes/test-ninos-1/29.jpg" },
        { number: 57, image: "imagenes/test-ninos-1/57.jpg" },
        { number: 5, image: "imagenes/test-ninos-1/5.jpg" },
        { number: 3, image: "imagenes/test-ninos-1/3.jpg" },
        { number: 15, image: "imagenes/test-ninos-1/15.jpg" },
        { number: 74, image: "imagenes/test-ninos-1/74.jpg" }
    ];

    let imagesCopy = [...images];
    let currentNumber = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let incorrectImages = [];

    const randomImageElement = document.getElementById("randomImage");
    const numberCards = document.getElementById("numberCards");
    const dropArea = document.getElementById("drop-area");
    const btnNoSeeKids = document.getElementById("btnNoSeeKids");
    const container = document.getElementById("container");

    function shuffleArray(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function getCard() {
        if (imagesCopy.length === 0) {
            let result = "¡Felicitaciones! Has completado el test de daltonismo. Tus respuestas sugieren que tienes una visión normal de los colores.";

            if (correctCount < incorrectCount) {
                result = "Has completado la prueba. Notamos que tuviste dudas con algunos números. Te recomendamos consultar a un oftalmólogo o especialista de la visión para una revisión más detallada.";
            }

            let incorrectAnswers = "";
            if (incorrectImages.length > 0) {
                incorrectAnswers = `
                    <details id="btnSeeAnswers">
                        <summary>Ver láminas revisadas (${incorrectImages.length})</summary>
                        <div class="containerIncorrectAnswers">
                            ${incorrectImages.map(item => `
                                <div class="incorrectAnswer">
                                    <img src="${item.image}" alt="Lámina ${item.number}">
                                    <p>Número correcto: ${item.number}</p>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `;
            }

            container.innerHTML = `
                <div class="containerResult">
                    <h2>Resultados de la prueba infantil</h2>
                    <p><strong>Aciertos:</strong> ${correctCount} de ${images.length}</p>
                    <p>${result}</p>
                    ${incorrectAnswers}
                    <div style="margin-top: 1.5rem;">
                        <a href="test-ninos-1.html" class="btn btn-primary" id="btnResult">Volver a jugar</a>
                    </div>
                </div>
            `;

            speakMessage(result);
            return;
        }

        // Elegir lámina aleatoria
        const index = Math.floor(Math.random() * imagesCopy.length);
        const currentPlate = imagesCopy.splice(index, 1)[0];
        currentNumber = currentPlate.number;
        randomImageElement.src = currentPlate.image;

        // Limpiar tarjetas
        numberCards.innerHTML = "";

        // Elegir 2 distractores
        const distractors = shuffleArray(images.filter(item => item.number !== currentNumber))
            .slice(0, 2)
            .map(item => item.number);

        const insertAt = Math.floor(Math.random() * 3);
        const cardNumbers = [...distractors.slice(0, insertAt), currentNumber, ...distractors.slice(insertAt)];

        cardNumbers.forEach(num => {
            const card = document.createElement("div");
            card.className = "card";
            card.textContent = num;
            card.draggable = true;
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.title = `Seleccionar número ${num}`;

            // Drag support
            card.addEventListener("dragstart", function (e) {
                e.dataTransfer.setData("text/plain", num.toString());
            });

            // Click directo support (para mayor accesibilidad)
            card.addEventListener("click", function () {
                processAnswer(num);
            });

            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    processAnswer(num);
                }
            });

            numberCards.appendChild(card);
        });
    }

    function processAnswer(selectedNum) {
        if (currentNumber === parseInt(selectedNum)) {
            correctCount++;
        } else {
            incorrectCount++;
            incorrectImages.push(images.find(img => img.number === currentNumber));
        }
        getCard();
    }

    // Configuración de Drop Area
    if (dropArea) {
        dropArea.addEventListener("dragover", function (e) {
            e.preventDefault();
            dropArea.classList.add("dragover");
        });

        dropArea.addEventListener("dragleave", function () {
            dropArea.classList.remove("dragover");
        });

        dropArea.addEventListener("drop", function (e) {
            e.preventDefault();
            dropArea.classList.remove("dragover");
            const draggedNumber = e.dataTransfer.getData("text/plain");
            if (draggedNumber) {
                processAnswer(draggedNumber);
            }
        });
    }

    // Botón "No veo nada"
    if (btnNoSeeKids) {
        btnNoSeeKids.addEventListener("click", function () {
            incorrectCount++;
            incorrectImages.push(images.find(img => img.number === currentNumber));
            getCard();
        });
    }

    // Iniciar primer tarjeta
    getCard();
});
