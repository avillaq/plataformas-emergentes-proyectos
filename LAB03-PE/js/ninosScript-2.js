import { speakMessage } from "./sintesisVoz.js";

document.addEventListener("DOMContentLoaded", function () {
    const images = [
        { number: 1, image: "imagenes/test-ninos-2/kids-color-blind-test-01.jpg" },
        { number: 2, image: "imagenes/test-ninos-2/kids-color-blind-test-02.jpg" },
        { number: 3, image: "imagenes/test-ninos-2/kids-color-blind-test-03.jpg" },
        { number: 4, image: "imagenes/test-ninos-2/kids-color-blind-test-04.jpg" },
        { number: 5, image: "imagenes/test-ninos-2/kids-color-blind-test-05.jpg" },
        { number: 6, image: "imagenes/test-ninos-2/kids-color-blind-test-06.jpg" },
        { number: 7, image: "imagenes/test-ninos-2/kids-color-blind-test-07.jpg" },
        { number: 8, image: "imagenes/test-ninos-2/kids-color-blind-test-08.jpg" },
        { number: 9, image: "imagenes/test-ninos-2/kids-color-blind-test-09.jpg" },
        { number: 10, image: "imagenes/test-ninos-2/kids-color-blind-test-10.jpg" }
    ];

    let imagesCopy = [...images];
    let currentNumber = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let incorrectImages = [];

    const randomImageElement = document.getElementById("randomImage");
    const radioInputs = document.getElementById("radio-inputs");
    const btnSiguiente = document.getElementById("btn-siguiente");
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
            let result = "¡Felicitaciones! Has completado el test de animales. Tu capacidad para distinguir las siluetas sugiere una visión de color normal.";

            if (correctCount < incorrectCount) {
                result = "Has terminado el test. Se detectaron algunas dificultades para ver ciertos animales entre los puntos de color. Sugerimos realizar una evaluación oftalmológica completa.";
            }

            let incorrectAnswers = "";
            if (incorrectImages.length > 0) {
                incorrectAnswers = `
                    <details id="btnSeeAnswers">
                        <summary>Ver láminas y respuestas (${incorrectImages.length})</summary>
                        <div class="containerIncorrectAnswers">
                            ${incorrectImages.map(item => `
                                <div class="incorrectAnswer">
                                    <img src="${item.image}" alt="Lámina ${item.number}">
                                    <p>Animal correcto:</p>
                                    <p><img class="incorrectAnswer-animal" src="imagenes/test-ninos-2/icons/${item.number}.jpg" alt="Icono ${item.number}"></p>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `;
            }

            container.innerHTML = `
                <div class="containerResult">
                    <h2>Resultados del Test de Animales</h2>
                    <p><strong>Aciertos:</strong> ${correctCount} de ${images.length}</p>
                    <p>${result}</p>
                    ${incorrectAnswers}
                    <div style="margin-top: 1.5rem;">
                        <a href="test-ninos-2.html" class="btn btn-primary" id="btnResult">Volver a jugar</a>
                    </div>
                </div>
            `;

            speakMessage(result);
            return;
        }

        const index = Math.floor(Math.random() * imagesCopy.length);
        const currentPlate = imagesCopy.splice(index, 1)[0];
        currentNumber = currentPlate.number;
        randomImageElement.src = currentPlate.image;

        radioInputs.innerHTML = "";

        const distractors = shuffleArray(images.filter(item => item.number !== currentNumber))
            .slice(0, 4)
            .map(item => item.number);

        const insertAt = Math.floor(Math.random() * 5);
        const options = [...distractors.slice(0, insertAt), currentNumber, ...distractors.slice(insertAt)];

        let html = "";
        options.forEach(num => {
            html += `
                <label>
                    <input class="radio-input" type="radio" name="animals" value="${num}">
                    <span class="radio-tile" title="Opción ${num}">
                        <span class="radio-icon">
                            <img src="imagenes/test-ninos-2/icons/${num}.jpg" alt="Animal opción ${num}">
                        </span>
                    </span>
                </label>
            `;
        });
        radioInputs.innerHTML = html;
    }

    if (btnSiguiente) {
        btnSiguiente.addEventListener("click", function (e) {
            e.preventDefault();
            const selected = document.querySelector('input[name="animals"]:checked');
            if (selected && currentNumber === parseInt(selected.value)) {
                correctCount++;
            } else {
                incorrectCount++;
                incorrectImages.push(images.find(img => img.number === currentNumber));
            }
            getCard();
        });
    }

    getCard();
});
