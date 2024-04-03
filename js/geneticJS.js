document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    let counter = 1;
    let circles = [];

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        circles.push({x: x, y: y, counter: counter});

        drawCircles();

        counter++;
    });

    function drawCircles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawLines();

        circles.forEach(function(circle) {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, 10, 0, Math.PI * 2, false);
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(102, 106, 134,0.8)';
            ctx.stroke();

            ctx.fillStyle = 'rgba(102, 106, 134,0.8)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(circle.counter.toString(), circle.x, circle.y);
        });
    }

    function drawLines() {
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                ctx.beginPath();
                ctx.moveTo(circles[i].x, circles[i].y);
                ctx.lineTo(circles[j].x, circles[j].y);
                ctx.strokeStyle = 'rgba(102, 106, 134,0.5)';
                ctx.stroke();
            }
        }
    }
});
