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

// Variables para almacenar datos y modelo
let data = [];
let labels = [];
let model = null;
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
            model = new PolynomialRegression();
            model.fit(data.map(row => row[0]), data.map(row => row[1]));
            break;
        case "arbol_decision":
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

    const selectedModel = modelSelect.value;
    let prediction = null;

    // Función de predicción específica para regresión lineal
    if (selectedModel === "regresion_lineal" || selectedModel === "regresion_polinomial") {
        const modal = document.getElementById("modalX");
        const span = document.getElementsByClassName("close")[0];
        const valorX = document.getElementById("valorX");
        const insertarX = document.getElementById("insertarX");

        modal.style.display = "block";

        span.onclick = function() {
            modal.style.display = "none";
        };

        insertarX.onclick = function() {
            modal.style.display = "none";
            const xVal = parseFloat(valorX.value);
            if (isNaN(xVal)) {
                alert("Ingrese un valor numérico para predecir.");
                return;
            }
            prediction = model.predict([xVal]);
            alert(`Resultado de predicción: ${JSON.stringify(prediction)}`);
        };
    } else {
        switch (selectedModel) {
            case "knn":
                const sample = [5.1, 3.5, 1.4, 0.2]; // Ejemplo de muestra
                prediction = model.predict(sample);
                break;
            case "arbol_decision":
                prediction = model.predict(data);
                break;
            default:
                alert("Modelo no soportado para predicción.");
                return;
        }
        if (prediction !== null) {
            alert(`Resultado de predicción: ${JSON.stringify(prediction)}`);
        }
    }
});

// Función para graficar resultados
showGraphButton.addEventListener("click", () => {
    if (!model) {
        alert("Primero entrena el modelo.");
        return;
    }

    const selectedModel = modelSelect.value;
    switch (selectedModel) {
        case "regresion_lineal":
            showRegressionChart();
            break;
        case "regresion_polinomial":
            showPolynomialRegressionChart();
            break;
        case "kmeans":
            showClusteringChart();
            break;
        default:
            alert("Este modelo no es compatible con gráficos.");
    }
});

// Función para graficar datos de regresión lineal
function showRegressionChart() {
    const xValues = data.map(row => row[0]);
    const yValues = data.map(row => row[1]);
    const yPredicted = model.predict(xValues); // Predicción del modelo entrenado
    renderChart(xValues, yValues, yPredicted, 'line');
}

// Función para graficar datos de regresión polinomial
function showPolynomialRegressionChart() {
    const xValues = data.map(row => row[0]);
    const yValues = data.map(row => row[1]);
    const yPredicted = model.predict(xValues); // Predicción del modelo entrenado
    renderChart(xValues, yValues, yPredicted, 'line');
}

// Función para graficar datos de clustering (ejemplo para K-Means)
function showClusteringChart() {
    const clusters = model.getClusters();
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

// Función para graficar resultados
showGraphButton.addEventListener("click", () => {
    renderChart(data, labels);
});

// Función para graficar resultados con Chart.js
function renderChart(data, labels) {
    const ctx = graphCanvas.getContext("2d");
    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Dataset',
                data: data.map(row => ({ x: row[0], y: row[1] })),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: false,
                showLine: true,
            }
        ]
    };

    new Chart(ctx, {
        type: 'scatter',
        data: chartData,
        options: {
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'X'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Y'
                    }
                }
            }
        }
    });
}