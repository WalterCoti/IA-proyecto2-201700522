// Elementos HTML
const fileInput = document.getElementById("fileInput");
const modelSelect = document.getElementById("modelSelect");
const trainPercentage = document.getElementById("trainPercentage");
const trainButton = document.getElementById("trainButton");
const predictButton = document.getElementById("predictButton");
const showGraphButton = document.getElementById("showGraphButton");
const graphCanvas = document.getElementById("graphCanvas");
const fileinputContent = document.getElementById("fileinputContent"); // Asegúrate de que el id sea correcto

// Variables para almacenar datos
let data = [];
let labels = [];
let model;
let fileContent = "";

// Función para leer el archivo CSV
fileInput.addEventListener("change", function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        fileContent = e.target.result;
        parseCSV(fileContent);
        fileinputContent.innerText = fileContent; // Usar innerText en lugar de innerHTML para texto plano
    };
    reader.readAsText(file);
});

// Función para parsear CSV a data y labels
function parseCSV(text) {
    const lines = text.trim().split("\n");
    data = [];
    labels = [];

    lines.forEach((line, index) => {
        const values = line.split(",");
        if (index === 0) {
            labels = values; // Asignamos etiquetas de columnas
        } else {
            data.push(values.map(value => parseFloat(value)));
        }
    });

    console.log("Datos cargados:", data);
    console.log("Etiquetas:", labels);
}

// Función para entrenar el modelo
trainButton.addEventListener("click", function() {
    const selectedModel = modelSelect.value;
    const percentage = parseInt(trainPercentage.value) / 100;

    switch (selectedModel) {
        case "knn":
            model = new KNearestNeighbor();
            model.inicializar(3, data, labels);
            break;
        case "kmeans":
            model = new KMeans();
            model.inicializar(3, data); // K = 3
            break;
        case "bayes":
            model = new NaiveBayes();
            model.train(data, labels);
            break;
        case "regresion_lineal":
            model = new LinearRegression();
            model.fit(data.map(row => row[0]), data.map(row => row[1]));
            break;
        default:
            alert("Modelo no soportado.");
            return;
    }

    alert("Entrenamiento completado");
});

// Función para predecir (Ejemplo de uso en kNN y Regresión Lineal)
predictButton.addEventListener("click", function() {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    let prediction;
    switch (modelSelect.value) {
        case "knn":
            const sample = [/* valores de ejemplo aquí */];
            prediction = model.predecir(sample);
            console.log("Predicción de k-NN:", prediction);
            break;
        case "regresion_lineal":
            const xValue = 5; // Cambia por el valor a predecir
            prediction = model.predict([xValue]);
            console.log("Predicción de Regresión Lineal:", prediction);
            break;
        // Agregar casos para otros modelos
        default:
            alert("Modelo no soportado para predicción.");
            return;
    }
    alert(`Resultado de predicción: ${JSON.stringify(prediction)}`);
});

// Función para graficar resultados
showGraphButton.addEventListener("click", function() {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    const ctx = graphCanvas.getContext("2d");
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    if (modelSelect.value === "regresion_lineal") {
        const xValues = data.map(row => row[0]);
        const yValues = data.map(row => row[1]);
        const yPredicted = model.predict(xValues);

        // Dibuja puntos originales
        yValues.forEach((y, i) => {
            ctx.beginPath();
            ctx.arc(xValues[i] * 10, graphCanvas.height - y * 10, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Dibuja línea de regresión
        ctx.beginPath();
        ctx.moveTo(xValues[0] * 10, graphCanvas.height - yPredicted[0] * 10);
        for (let i = 1; i < xValues.length; i++) {
            ctx.lineTo(xValues[i] * 10, graphCanvas.height - yPredicted[i] * 10);
        }
        ctx.stroke();
    }

    // Otros gráficos para otros modelos según sea necesario
});