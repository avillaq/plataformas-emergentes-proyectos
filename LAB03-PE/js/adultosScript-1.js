import { speakMessage } from "./sintesisVoz.js";

document.addEventListener("DOMContentLoaded", function () {
    const pairs = [
        { number: 97, image: "imagenes/test-adultos-1/97.jpg" },
        { number: 96, image: "imagenes/test-adultos-1/96.jpg" },
        { number: 26, image: "imagenes/test-adultos-1/26.jpg" },
        { number: 42, image: "imagenes/test-adultos-1/42.jpg" },
        { number: 7, image: "imagenes/test-adultos-1/7.jpg" },
        { number: 35, image: "imagenes/test-adultos-1/35.jpg" },
        { number: 16, image: "imagenes/test-adultos-1/16.jpg" },
        { number: 73, image: "imagenes/test-adultos-1/73.jpg" },
        { number: 2, image: "imagenes/test-adultos-1/2.jpg" }
    ];

    let imagesCopy = [...pairs];
    let currentNumber = 0;
    let userNumbers = [];
    let countCorrect = 0;
    let countIncorrect = 0;
    let incorrectImages = [];

    const randomImageElement = document.getElementById("randomImage");
    const userNumbersContainer = document.getElementById("userNumbers");
    const checkButton = document.getElementById("checkButton");
    const clearButton = document.getElementById("clearButton");
    const noSeeButton = document.getElementById("noSeeButton");
    const keyboards = document.querySelectorAll(".keyboardKey");
    const gameContainer = document.getElementById("gameContainer");

    function renderDigits() {
        if (!userNumbersContainer) return;
        const d1 = userNumbers[0] !== undefined ? userNumbers[0] : "";
        const d2 = userNumbers[1] !== undefined ? userNumbers[1] : "";
        userNumbersContainer.innerHTML = `
            <div class="digit-slot">${d1}</div>
            <div class="digit-slot">${d2}</div>
        `;
    }

    function resetComponents() {
        userNumbers = [];
        renderDigits();
    }

    function getNextImage() {
        if (imagesCopy.length === 0) {
            let result = "¡Excelente desempeño! Has respondido correctamente a la mayoría de las placas de Ishihara. Esto sugiere que tu visión cromática se encuentra dentro de los parámetros normales.";

            if (countCorrect < countIncorrect) {
                result = "Has tenido discrepancias en varias placas diagnósticas. Esto puede indicar una posible deficiencia en el eje rojo-verde (Protan / Deutan). Te sugerimos acudir a un oftalmólogo para una evaluación completa.";
            }

            let incorrectAnswers = "";
            if (incorrectImages.length > 0) {
                incorrectAnswers = `
                    <details id="btnSeeAnswers">
                        <summary>Ver láminas con errores (${incorrectImages.length})</summary>
                        <div class="containerIncorrectAnswers">
                            ${incorrectImages.map(img => `
                                <div class="incorrectAnswer">
                                    <img src="${img.image}" alt="Lámina ${img.number}">
                                    <p>Respuesta correcta: ${img.number}</p>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `;
            }

            gameContainer.innerHTML = `
                <div class="containerResult">
                    <h2>Resultados del Test de Ishihara</h2>
                    <p><strong>Aciertos:</strong> ${countCorrect} de ${pairs.length}</p>
                    <p>${result}</p>
                    ${incorrectAnswers}
                    <div style="margin-top: 1.5rem;">
                        <a href="test-Adultos-1.html" class="btn btn-primary" id="btnResult">Repetir prueba</a>
                    </div>
                </div>
            `;

            speakMessage(result);
            return;
        }

        const index = Math.floor(Math.random() * imagesCopy.length);
        const randomImage = imagesCopy.splice(index, 1)[0];
        currentNumber = randomImage.number;
        randomImageElement.src = randomImage.image;
        resetComponents();
    }

    function addDigit(digit) {
        if (userNumbers.length < 2) {
            userNumbers.push(digit);
            renderDigits();
        }
    }

    function processSubmission() {
        if (userNumbers.length === 0) return;
        const entered = parseInt(userNumbers.join(""), 10);
        if (currentNumber === entered) {
            countCorrect++;
        } else {
            countIncorrect++;
            incorrectImages.push(pairs.find(item => item.number === currentNumber));
        }
        getNextImage();
    }

    // Teclado en pantalla
    keyboards.forEach(key => {
        key.addEventListener("click", function () {
            const digit = parseInt(this.textContent.trim(), 10);
            if (!isNaN(digit)) {
                addDigit(digit);
            }
        });
    });

    if (checkButton) {
        checkButton.addEventListener("click", processSubmission);
    }

    if (clearButton) {
        clearButton.addEventListener("click", resetComponents);
    }

    if (noSeeButton) {
        noSeeButton.addEventListener("click", function () {
            countIncorrect++;
            incorrectImages.push(pairs.find(item => item.number === currentNumber));
            getNextImage();
        });
    }

    // Soporte para Teclado Físico (Accesibilidad y Rapidez)
    window.addEventListener("keydown", function (e) {
        if (gameContainer.querySelector(".containerResult")) return;

        if (e.key >= "0" && e.key <= "9") {
            addDigit(parseInt(e.key, 10));
        } else if (e.key === "Backspace") {
            userNumbers.pop();
            renderDigits();
        } else if (e.key === "Enter") {
            processSubmission();
        } else if (e.key.toLowerCase() === "n") {
            if (noSeeButton) noSeeButton.click();
        }
    });

    // Iniciar test
    renderDigits();
    getNextImage();
});
