document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById("map");
    document.getElementById("createMap").addEventListener("click", function() {
        drawMap();
        highlightedSquares = [];
    });
    canvas.addEventListener("click", handleClick);
    canvas.addEventListener("dblclick", handleDoubleClick);
});

let squares = [];
let highlightedSquares = [];

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
        if (square.doubleClicked) {
            ctx.fillStyle = 'blue';
        } else if (square.clicked) {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
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
