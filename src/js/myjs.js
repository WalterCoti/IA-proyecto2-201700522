// Elementos HTML
const fileInput = document.getElementById("fileInput");
const modelSelect = document.getElementById("modelSelect");
const trainPercentage = document.getElementById("trainPercentage");
const trainButton = document.getElementById("trainButton");
const predictButton = document.getElementById("predictButton");
const showGraphButton = document.getElementById("showGraphButton");
const graphCanvas = document.getElementById("graphCanvas");
const fileContent = document.getElementById("fileContent");
const xValue = document.getElementById("valorX");

// Variables para almacenar datos
let data = [];
let labels = [];
let model;
let csvContent = "";

// Función para leer el archivo CSV
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
        csvContent = e.target.result;
        parseCSV(csvContent);
        fileContent.value = csvContent;
    };
    reader.readAsText(file);
});

// Función para parsear CSV
function parseCSV(text) {
    const lines = text.trim().split("\n");
    data = [];
    labels = [];

    lines.forEach((line, index) => {
        const values = line.split(",");
        if (index === 0) {
            labels = values;
        } else {
            data.push(values.map(value => parseFloat(value)));
        }
    });
    console.log("Datos cargados:", data);
    console.log("Etiquetas:", labels);
}

// Función para entrenar el modelo
trainButton.addEventListener("click", () => {
    const selectedModel = modelSelect.value;
    const percentage = parseInt(trainPercentage.value) / 100;

    switch (selectedModel) {
        case "knn":
            model = new KNearestNeighbor();
            model.inicializar(3, data, labels);
            break;
        case "kmeans":
            model = new KMeans();
            model.inicializar(3, data);
            break;
        case "bayes":
            model = new NaiveBayes();
            model.train(data, labels);
            break;
        case "regresion_lineal":
            model = new LinearRegression();
            model.fit(data.map(row => row[0]), data.map(row => row[1]));
            break;
        case "regresion_polinomial":
            // Implementación para regresión polinomial
            model = new PolynomialRegression();
            model.fit(data.map(row => row[0]), data.map(row => row[1]));
            break;
        case "arbol_decision":
            // Implementación para árbol de decisión
            model = new DecisionTreeID3(data);
            model.train(data);
            break;
        default:
            alert("Modelo no soportado.");
            return;
    }
    alert("Entrenamiento completado");
});

// Función para predicción
predictButton.addEventListener("click", () => {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    let prediction;
    switch (modelSelect.value) {
        case "knn":
            const sample = [5.1, 3.5, 1.4];
            prediction = model.predecir(sample);
            break;
        case "regresion_lineal":
            
            //obtener el valor del modal
            const modal = document.getElementById("modalX");
            const span = document.getElementsByClassName("close")[0];
            const valorX = document.getElementById("valorX");
            const insertarX = document.getElementById("insertarX");
            modal.style.display = "block";
            span.onclick = function() {
                modal.style.display = "none";
            }
            insertarX.onclick = function() {
                modal.style.display = "none";
            }
            const Value = valorX.value;
            prediction = model.predict([Value]);
            break;
        case "regresion_polinomial":

            const xValue = 5;
            prediction = model.predict([xValue]);
            break;
        case "arbol_decision":
            prediction = model.predict(data);
            break;
        default:
            alert("Modelo no soportado para predicción.");
            return;
    }
    alert(`Resultado de predicción: ${JSON.stringify(prediction)}`);
});

// Función para graficar resultados
showGraphButton.addEventListener("click", () => {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    const ctx = graphCanvas.getContext("2d");
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    if (modelSelect.value === "regresion_lineal" || modelSelect.value === "regresion_polinomial") {
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

    if (modelSelect.value === "kmeans") {
        // Implementación para graficar clusters
        // Acceder a los centros y asignaciones de los clusters
    }

    let chartInstance = null; // Variable global para almacenar la instancia de Chart.js

// Función para mostrar la gráfica con Chart.js
function renderChart(xData, yData, yPredicted = null, type = 'scatter') {
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    // Destruir la instancia de gráfico previa si existe, para evitar superposiciones
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Configuración del gráfico
    const config = {
        type: type === 'scatter' ? 'scatter' : 'line',
        data: {
            datasets: [
                {
                    label: 'Datos Originales',
                    data: xData.map((x, i) => ({ x: x, y: yData[i] })),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    showLine: false, // Solo puntos
                    pointRadius: 4,
                },
                {
                    label: 'Predicción',
                    data: yPredicted ? xData.map((x, i) => ({ x: x, y: yPredicted[i] })) : [],
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    showLine: true,
                    pointRadius: 0,
                }
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'X' },
                },
                y: {
                    title: { display: true, text: 'Y' },
                }
            }
        }
    };

    // Crear el gráfico
    chartInstance = new Chart(ctx, config);
}

// Función para graficar datos de regresión
function showRegressionChart() {
    const xValues = data.map(row => row[0]);
    const yValues = data.map(row => row[1]);
    const yPredicted = model.predict(xValues); // Predicción del modelo entrenado
    renderChart(xValues, yValues, yPredicted, 'line');
}

// Función para graficar datos de clustering (ejemplo para K-Means)
function showClusteringChart() {
    const clusters = model.getClusters(); // Método del modelo para obtener clusters (suponiendo que lo tienes implementado)
    const datasets = clusters.map((cluster, index) => ({
        label: `Cluster ${index + 1}`,
        data: cluster.map(point => ({ x: point[0], y: point[1] })),
        backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
        pointRadius: 4,
    }));

    const ctx = document.getElementById('chartCanvas').getContext('2d');
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            scales: {
                x: { type: 'linear', position: 'bottom', title: { display: true, text: 'X' } },
                y: { title: { display: true, text: 'Y' } }
            }
        }
    });
}

// Modificación del event listener para graficar según el modelo
showGraphButton.addEventListener("click", () => {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    switch (modelSelect.value) {
        case "regresion_lineal":
        case "regresion_polinomial":
            showRegressionChart();
            break;
        case "kmeans":
            showClusteringChart();
            break;
        default:
            alert("Este modelo no es compatible con gráficos.");
    }
});

});
