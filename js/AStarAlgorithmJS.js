
document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("map");
    document.getElementById("resetMap").addEventListener("click", function() {
        drawMap();
        highlightedSquares = [];
        pathFound = false;
    });
    document.getElementById("findPath").addEventListener("click", findPath);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("dblclick", handleDoubleClick);
});

let isDrawing = false;
let lastSquare = null;

function handleMouseDown(event) {
    const square = getSquare(event);
    if (!square) return;

    isDrawing = true;
    lastSquare = square;
    toggleSquareState(square);
    drawSquares();
}

function handleMouseMove(event) {
    if (!isDrawing) return;

    const square = getSquare(event);
    if (!square || square === lastSquare) return;

    lastSquare = square;
    toggleSquareState(square);
    drawSquares();
}

function handleMouseUp(event) {
    isDrawing = false;
    lastSquare = null;
}

function toggleSquareState(square) {
    if (!square.clicked && !square.doubleClicked) {
        square.clicked = true;
    } else if (square.clicked) {
        square.clicked = false;
    }
}


var rangeInput = document.querySelector('.input_size_map');
var numberInput = document.querySelector('.input_size_map_num');

rangeInput.addEventListener('input', function() {
    numberInput.value = rangeInput.value;
    drawMap();
    highlightedSquares = [];
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
    highlightedSquares = [];
});

let squares = [];
let highlightedSquares = [];
let pathFound = false;

//Расстояние между точками пути
function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Восстанавливаеем путь отслеживая обратно от конечного квадрата к начальному.
function reconstructPath(current) {
    let path = [];
    while (current) {
        path.unshift(current);
        current = current.previous;
    }
    return path;
}

//Получение соседних квадратов для квадрата
function getNeighbors(square, squares, countSquares) {
    const neighbors = [];
    const index = squares.indexOf(square);
    const row = Math.floor(index / countSquares);
    const col = index % countSquares;

    if (row > 0) neighbors.push(squares[index - countSquares]);
    if (row < countSquares - 1) neighbors.push(squares[index + countSquares]);
    if (col > 0) neighbors.push(squares[index - 1]);
    if (col < countSquares - 1) neighbors.push(squares[index + 1]);

    return neighbors;
}

function findPath() {
    if (highlightedSquares.length < 2 || pathFound) return;

    const start = highlightedSquares[0];
    const end = highlightedSquares[1];
    const countSquares = Math.sqrt(squares.length);

    //узлы для рассмотрения
    let openSet = [start];
    //узлы которые уже были рассмотрены
    let closedSet = [];

    start.g = 0;
    start.h = distance(start, end);
    start.f = start.h;
    //оценка узлов
    while (openSet.length > 0) {
        //выбор узла с наименьшим значением функции f
        let current = openSet.reduce((a, b) => a.f < b.f ? a : b);

        //строим и отображаем путь если текущий узел является конечной точкой
        if (current === end) {
            let path = reconstructPath(current);
            drawPathStepByStep(path);
            pathFound = true;
            return;
        }
        //удаляем текущий узел из открытого списка и добавляем его в закрытый список
        openSet = openSet.filter(square => square !== current);
        closedSet.push(current);

        const neighbors = getNeighbors(current, squares, countSquares);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];
            // Пропускаем узлы которые уже рассмотрены или заблокированы
            if (closedSet.includes(neighbor) || neighbor.clicked) continue;

            //расчитываем стоимость пути до соседнего узла
            const tempG = current.g + distance(current, neighbor);

            //если узел еще не в открытом списке или найден более короткий путь до узла
            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tempG >= neighbor.g) {
                continue;
            }

            //обновляем значения для соседнего узла.
            neighbor.g = tempG;
            neighbor.h = distance(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
            //сохраненяем ссылки на текущий узел как предыдущий для соседа.
            neighbor.previous = current;
        }
    }
}

function drawPathStepByStep(path) {
    path.forEach((square, index) => {
        setTimeout(() => {
            square.path = true;
            drawSquares();
        }, index * 100);
    });
}



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
                doubleClicked: false,
                clickCount: 0
            });
        }
    }
    drawSquares();
}


function handleDoubleClick(event) {
    if (pathFound) return;

    const square = getSquare(event);
    if (!square) return;

    if (highlightedSquares.length < 2) {
        if (!square.doubleClicked) {
            square.doubleClicked = true;
            highlightedSquares.push(square);

            squares.forEach(s => s.clickCount = 0);
        }
    } else {
        if (!square.doubleClicked) {
            highlightedSquares[0].doubleClicked = false;
            highlightedSquares.shift();
            square.doubleClicked = true;
            highlightedSquares.push(square);
        }
    }

    drawSquares();
}

function drawSquares() {
    const canvas = document.getElementById("map");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    squares.forEach(function(square) {
        if (square.path) {
            ctx.fillStyle = 'rgb(178, 201, 171)';
        } else if (square.doubleClicked) {
            if (square === highlightedSquares[0]) {
                ctx.fillStyle = 'rgb(255,211,107)';
            } else if (square === highlightedSquares[1]) {
                ctx.fillStyle = 'rgb(255,188,0)';
            }
        } else if (square.clicked) {
            ctx.fillStyle = 'rgb(107, 113, 126)';
        } else {
            ctx.fillStyle = 'rgb(232, 221, 181)'
        }
        ctx.fillRect(square.x, square.y, square.size, square.size);
    });
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

drawMap();


