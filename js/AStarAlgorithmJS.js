document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("createMap").addEventListener("click", drawMap);
});

function drawMap() {
    var canvas = document.getElementById("map");
    if (!canvas.getContext) {
        return;
    }
    var ctx = canvas.getContext("2d");
    var countSquares = parseInt(document.querySelector(".input_size_map").value);
    var gap = 5;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var squareSize = (canvas.width - gap * (countSquares + 1)) / countSquares;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var row = 0; row < countSquares; row++) {
        for (var col = 0; col < countSquares; col++) {
            var x = col * (squareSize + gap) + gap;
            var y = row * (squareSize + gap) + gap;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x, y, squareSize, squareSize);
        }
    }
}
