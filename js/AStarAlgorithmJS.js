document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("map");
    document.getElementById("resetMap").addEventListener("click", function() {
        drawMap();
        highlightedSquares = [];
        pathFound = false;
    });
    document.getElementById("findPath").addEventListener("click", findPath);
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("dblclick", handleDoubleClick);

});

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

function reconstructPath(current) {
    let path = [];
    while (current) {
        path.unshift(current);
        current = current.previous;
    }
    return path;
}

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

    let openSet = [start];
    let closedSet = [];
    start.g = 0;
    start.h = distance(start, end);
    start.f = start.h;

    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => a.f < b.f ? a : b);

        if (current === end) {
            let path = reconstructPath(current);
            drawPathStepByStep(path);
            pathFound = true;
            return;
        }

        openSet = openSet.filter(square => square !== current);
        closedSet.push(current);

        const neighbors = getNeighbors(current, squares, countSquares);
        for (let i = 0; i < neighbors.length; i++) {
            const neighbor = neighbors[i];

            if (closedSet.includes(neighbor) || neighbor.clicked) continue;

            const tempG = current.g + distance(current, neighbor);

            if (!openSet.includes(neighbor)) {
                openSet.push(neighbor);
            } else if (tempG >= neighbor.g) {
                continue;
            }

            neighbor.g = tempG;
            neighbor.h = distance(neighbor, end);
            neighbor.f = neighbor.g + neighbor.h;
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

function handleClick(event) {
    if (pathFound) return;

    const square = getSquare(event);
    if (!square) return;

    if (++square.clickCount === 3) {
        square.clicked = false;
        square.doubleClicked = false;
        square.clickCount = 0;

        highlightedSquares = highlightedSquares.filter(s => s !== square);
    } else {
        square.clicked = !square.clicked;

        if (square.doubleClicked) {
            square.doubleClicked = false;
            highlightedSquares = highlightedSquares.filter(s => s !== square);
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
            ctx.fillStyle = 'rgb(231, 187, 65)';
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