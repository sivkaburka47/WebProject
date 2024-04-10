document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("map");
    document.getElementById("resetMap").addEventListener("click", function() {
        drawMap();
        dots = [];
        grouped = false;
    });
    document.getElementById("group").addEventListener("click", kmeans);
    document.addEventListener("click", handleClick);
    document.addEventListener("mousedown", start);
    document.addEventListener("mouseup", stop);
});

drawMap();
grouped = false;

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
    } else if (val > 40) {
        numberInput.value = 40;
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

// Количество кластеров
var clusterQuantityRangeInput = document.querySelector('.input_number_clusters');
var clusterQuantityNumberInput = document.querySelector('.input_number_clusters_num');
let clusterQuantity;
let clusterCenters = [];

clusterQuantityRangeInput.addEventListener('input', function() {
    clusterQuantityNumberInput.value = clusterQuantityRangeInput.value;
});

clusterQuantityNumberInput.addEventListener('blur', function() {
    let val = parseInt(clusterQuantityNumberInput.value, 10);
    if (val < 1) {
        clusterQuantityNumberInput.value = 1;
    } else if (val > 5) {
        clusterQuantityNumberInput.value = 5;
    }
    clusterQuantityRangeInput.value = clusterQuantityNumberInput.value;
});

// Массив центров кластеров, каждому индексу пресущи три значения x, y (заполнены случайными числами), а также used (использован ли кластер)
function centers() {
    clusterQuantity = parseInt(document.querySelector(".input_number_clusters").value) || 2;
    const canvas = document.getElementById("map");
    for (let i = 0; i < clusterQuantity; i++)
    {
        clusterCenters[i] = { x: Math.floor(Math.random() * canvas.width), y: Math.floor(Math.random() * canvas.height), used: false};
    }
}

// Рисование квадратов
function start(event)
{
    document.addEventListener("mousemove", handleClick);
}

function stop() 
{
    document.removeEventListener("mousemove", handleClick);
}

function handleClick(event) {
    if (grouped) return;

    const square = getSquare(event);
    if (!square) return;

    if (square.clicked === true && event.type === "click") {
        square.clicked = false;
        dots = dots.filter(n => n.y !== square.y || n.x !== square.x);
    } else {
        square.clicked = true;
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
        if (dots[i].whichCluster === clusterIndex)
        {
            center.x += dots[i].x;
            center.y += dots[i].y;
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
    var startTime = new Date();
    var endTime = new Date();

    let dotsBest = [];
    for (let i = 0; i < dots.length; i++)
    {
        dotsBest.push({x: dots[i].x, y: dots[i].y, whichCluster: dots[i].whichCluster});
    }

    let qualityBest = 0;

    let clusterCentersPrev = [];

    var firstIter = false;

    while (true)
    {
        centers();

        if (dots.length < clusterCenters.length)
        {
            alert("The number of points must be greater than the number of clusters");
            return;
        }

        let quality = 0;

        for (let i = 0; i < dots.length; i++)
        {
            let minCluster = {clusterIndex: -1, length: Number.MAX_SAFE_INTEGER};
            for (let j = 0; j < clusterQuantity; j++)
            {
                if (Math.sqrt((clusterCenters[j].x - dots[i].x) ** 2 + (clusterCenters[j].y - dots[i].y) ** 2) < minCluster.length)
                {
                    minCluster.clusterIndex = j;
                    minCluster.length = Math.sqrt((clusterCenters[j].x - dots[i].x) ** 2 + (clusterCenters[j].y - dots[i].y) ** 2);
                }
            }
            
            dots[i].whichCluster = minCluster.clusterIndex;

            clusterCenters[minCluster.clusterIndex] = findGeometricalCenter(dots, minCluster.clusterIndex);
            clusterCenters[minCluster.clusterIndex].used = true;
        }

        for (let i = 0; i < clusterCenters.length && firstIter === true; i++)
        {
            if (clusterCenters[i].x === clusterCentersPrev[i].x && clusterCenters[i].y === clusterCentersPrev[i].y)
            {
                quality++;
            }
            if (clusterCenters[i].used === true)
            {
                quality++;
            }
        }

        if (quality === clusterCenters.length * 2)
        {
            break;
        }
        else
        {
            clusterCentersPrev = [];
            for (let i = 0; i < clusterCenters.length; i++)
            {
                clusterCentersPrev.push({x: clusterCenters[i].x, y: clusterCenters[i].y});
            }

            if (quality > qualityBest)
            {
                qualityBest = quality;
                dotsBest = [];

                for (let i = 0; i < dots.length; i++)
                {
                    dotsBest.push({x: dots[i].x, y: dots[i].y, whichCluster: dots[i].whichCluster});
                }
            }
        }

        endTime = new Date();
        firstIter = true;

        if (endTime - startTime > 5000)
        {
            dots = dotsBest;
            break;
        }
    }

    // Меняем цвет
    for (let i = 0; i < dots.length; i++)
    {
        const canvas = document.getElementById("map");
        const ctx = canvas.getContext("2d");

        switch (dots[i].whichCluster)
        {
            case 0:
                ctx.fillStyle = 'rgb(153, 0, 0)'; // Красный
                break;
            case 1:
                ctx.fillStyle = 'rgb(0, 0, 153)'; // Синий
                break;
            case 2:
                ctx.fillStyle = 'rgb(0, 109, 91)'; // Зеленый
                break;
            case 3:
                ctx.fillStyle = 'rgb(13, 152, 186)'; // Голубой
                break;
            case 4:
                ctx.fillStyle = 'rgb(136, 78, 160)'; // Фиолетовый
                break;
            default:
                ctx.fillStyle = 'rgb(107, 113, 126)'; // Серый
                break
        }

        ctx.fillRect(dots[i].x, dots[i].y, squares[0].size, squares[0].size);
    }
}