document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    const resetButton = document.getElementById('resetMap');
    const showDigitCanvas = document.getElementById('mapShowDigit');
    const showDigitCtx = showDigitCanvas.getContext('2d');
    const readDigitButton = document.getElementById('readDigit');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    console.log(showDigitCanvas.width);

    showDigitCanvas.width = 50;
    showDigitCanvas.height = 50;

    let isDrawing = false;
    let minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;

    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        minX = Infinity, minY = Infinity, maxX = 0, maxY = 0;
    };

    resetButton.addEventListener('click', clearCanvas);

    const getMousePosition = (canvas, evt) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    const updateBounds = (x, y) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    }

    const startDrawing = (e) => {
        isDrawing = true;
        const {x, y} = getMousePosition(canvas, e);
        updateBounds(x, y);
        draw(e);
    };

    const stopDrawing = () => {
        isDrawing = false;
        ctx.beginPath();
    };

    const draw = (e) => {
        if (!isDrawing) return;
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        const {x, y} = getMousePosition(canvas, e);
        updateBounds(x, y);

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    canvas.addEventListener('mousemove', draw);

    readDigitButton.addEventListener('click', () => {
        if (minX < Infinity && minY < Infinity && maxX > 0 && maxY > 0) {

            const originalWidth = maxX - minX;
            const originalHeight = maxY - minY;

            const scale = Math.min(36 / originalWidth, 36 / originalHeight);

            const scaledWidth = originalWidth * scale;
            const scaledHeight = originalHeight * scale;

            const dx = (50 - scaledWidth) / 2;
            const dy = (50 - scaledHeight) / 2;

            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = scaledWidth;
            tempCanvas.height = scaledHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(canvas, minX, minY, originalWidth, originalHeight, 0, 0, scaledWidth, scaledHeight);

            showDigitCtx.clearRect(0, 0, 50, 50);
            showDigitCtx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight, dx, dy, scaledWidth, scaledHeight);
        }
    });







});
