import { speakMessage } from "./sintesisVoz.js";

document.addEventListener("DOMContentLoaded", function () {
    const containerGroupCheckBox = document.querySelector("#containerGroupCheckBox");
    const solucionContainer = document.querySelector("#solucion");
    const btnVerSolucionVolver = document.getElementById("btnVerSolucionVolver");

    if (btnVerSolucionVolver) {
        btnVerSolucionVolver.addEventListener("click", function (e) {
            e.preventDefault();

            if (btnVerSolucionVolver.textContent.includes("Ver solucion") || btnVerSolucionVolver.textContent.includes("Ver solución")) {
                const checkedInputs = document.querySelectorAll('input[type="checkbox"]:checked');
                const count = checkedInputs.length;
                let result = "";

                if (count <= 1) {
                    result = "Parece que estás teniendo dificultades para identificar los animales en la imagen. Esto podría indicar una posible deficiencia de visión de color.";
                } else if (count <= 3) {
                    result = "Has encontrado algunos animales. Podrías tener una deficiencia de visión de color leve.";
                } else if (count <= 5) {
                    result = "¡Buen trabajo! Has logrado identificar la mayoría de los animales ocultos. Esto sugiere una percepción de color normal o con variaciones leves.";
                } else {
                    result = "¡Excelente! Has encontrado todos los animales con gran precisión. Tu visión de color responde adecuadamente.";
                }

                speakMessage(`${result} Te recomendamos consultar a un oftalmólogo para una valoración clínica formal.`);

                containerGroupCheckBox.style.display = "none";
                solucionContainer.style.display = "block";
                btnVerSolucionVolver.textContent = "Volver a la selección";
            } else {
                containerGroupCheckBox.style.display = "flex";
                solucionContainer.style.display = "none";
                btnVerSolucionVolver.textContent = "Ver solución";
            }
        });
    }
});
