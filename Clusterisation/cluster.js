document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("map");
    document.getElementById("resetMap").addEventListener("click", function() {
        drawMap();
        dots = [];
        grouped = false;
    });
    document.getElementById("findPath").addEventListener("click", kmeans);
    canvas.addEventListener("click", handleClick);
});

var rangeInput = document.querySelector('.input_size_map');
var numberInput = document.querySelector('.input_size_map_num');

rangeInput.addEventListener('input', function() {
    numberInput.value = rangeInput.value;
    drawMap();
    dots = [];
});

numberInput.addEventListener('blur', function() {
    let val = parseInt(numberInput.value, 10);
    if (val < 5) {
        numberInput.value = 5;
    } else if (val > 50) {
        numberInput.value = 50;
    }
    rangeInput.value = numberInput.value;
    drawMap();
    dots = [];
});

function drawMap() {
    const canvas = document.getElementById("map");
    if (!canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const countSquares = parseInt(document.querySelector(".input_size_map").value) || 10;
    const gap = 5;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const squareSize = (canvas.width - gap * (countSquares + 1)) / countSquares;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    squares = [];

for (let row = 0; row < countSquares; row++) {
        for (let col = 0; col < countSquares; col++) {
            const x = col * (squareSize + gap) + gap;
            const y = row * (squareSize + gap) + gap;

            squares.push({
                x: x,
                y: y,
                size: squareSize,
                clicked: false,
                clickCount: 0
            });
        }
    }
    drawSquares();
}

function drawSquares() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    squares.forEach(function(square) {
        if (square.clicked) {
            ctx.fillStyle = 'rgb(107, 113, 126)';
        } else {
            ctx.fillStyle = 'rgb(232, 221, 181)'
        }
        ctx.fillRect(square.x, square.y, square.size, square.size);
    });
}

let dots = []; /* В массиве точек каждому индексу пресущи три значения x, y и whichCluster
(показывает к какому кластеру относится точка, если ни к какому, то whichCluster = -1)  */

// Количество кластеров !!! НЕ РАБОТАЕТ НУЖНО ИСПРАВИТЬ !!!
/*var clusterQuantityRangeInput = document.querySelector('.input_number_clusters');
var clusterQuantityNumberInput = document.querySelector('.input_size_clusters_num');

clusterQuantityRangeInput.addEventListener('input', function() {
    clusterQuantityNumberInput.value = clusterQuantityRangeInput.value;
});

clusterQuantityNumberInput.addEventListener('blur', function() {
    let val = parseInt(clusterQuantityNumberInput.value, 10);
    if (val < 5) {
        clusterQuantityNumberInput.value = 5;
    } else if (val > 50) {
        clusterQuantityNumberInput.value = 50;
    }
    clusterQuantityRangeInput.value = clusterQuantityNumberInput.value;
});

let clusterQuantity = clusterQuantityRangeInput;*/

let clusterQuantity = 2; // Число кластеров

// Массив центров кластеров, каждому индексу пресущи два значения x и y, заполнен случайными числами от 0 до размера матрицы
let clusterCenters = [];
const canvas = document.getElementById("map");
for (let i = 0; i < clusterQuantity; i++)
{
    clusterCenters[i] = { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height)};
}

// Нажатие на квадрат
function handleClick(event) {
    if (grouped) return;

    const square = getSquare(event);
    if (!square) return;

    if (++square.clickCount === 2) {
        square.clicked = false;
        square.clickCount = 0;
        dots = dots.filter(n => n.y !== square.y || n.x !== square.x);
    } else {
        square.clicked = !square.clicked;
        dots.push({x: square.x, y: square.y, whichCluster: -1});
    }

    drawSquares();
}

function getSquare(event) {
    const canvas = document.getElementById("map");
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    return squares.find(square =>
        mouseX > square.x && mouseX < square.x + square.size &&
        mouseY > square.y && mouseY < square.y + square.size
    );
}

// Функция поиска геометрического центра
function findGeometricalCenter(dots, clusterIndex)
{
    let center = {x: 0, y: 0};
    let dotsQuantity = 0;

    for (let i = 0; i < dots.length; i++)
    {
        if (dots[i].whichCluster == clusterIndex)
        {
            center.x += dots[i].y;
            center.y += dots[i].x;
            dotsQuantity++;
        }
    }

    center.x /= dotsQuantity;
    center.y /= dotsQuantity;

    return center;
}

// Алгоритм к-средних для разделения на кластеры
function kmeans()
{
    for (let i = 0; i < dots.length; i++)
    {
        let minCluster = {clusterIndex: -1, length: Number.MAX_SAFE_INTEGER};
        for (let j = 0; j < clusterQuantity; j++)
        {
            if (Math.sqrt((clusterCenters[j].x - dots[i].x) ** 2 + (clusterCenters[j].y - dots[i].x) ** 2) < minCluster.length)
            {
                minCluster.clusterIndex = j;
                minCluster.length = Math.sqrt((clusterCenters[j].x - dots[i].x) ** 2 + (clusterCenters[j].y - dots[i].y) ** 2);
            }
        }

        dots[i].whichCluster = minCluster.clusterIndex;

        // Меняем цвет
        const canvas = document.getElementById("map");
        const ctx = canvas.getContext("2d");

        // !!! КОГДА БУДЕТ ГОТОВО ИЗМЕНЕНИЕ ЧИСЛА КЛАСТЕРОВ СДЕЛАТЬ ЛИБО МАССИВ ЦВЕТОВ ЛИБО СВИТЧ ДЛЯ КАЖДОГО КЛАСТЕРА !!!
        if (dots[i].whichCluster === 0)
        {
            ctx.fillStyle = 'rgb(255, 0, 0)';
        }
        else
        {
            ctx.fillStyle = 'rgb(0, 0, 255)';
        }
        ctx.fillRect(dots[i].x, dots[i].y, squares[0].size, squares[0].size);

        clusterCenters[minCluster.clusterIndex] = findGeometricalCenter(dots, minCluster.clusterIndex);
    }
}