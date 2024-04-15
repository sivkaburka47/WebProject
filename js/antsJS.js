const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
let counter = 1;
let circles = [];
let edges = [];

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

document.addEventListener("DOMContentLoaded", function() {
    canvas.addEventListener("click", handleClick);
    document.getElementById("start").addEventListener("click", antsAlgo);

    document.getElementById('resetMap').addEventListener('click', function() {
        resetCanvas();
    });
});

// Нажатие
function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    circles.push({x: x, y: y, counter: counter});

    recalculateEdges();

    drawCircles();

    counter++;
};

// Пересчет ребер
function recalculateEdges() {
    edges = [];

    for (let i = 0; i < circles.length; i++) {
        for (let j = 0; j < circles.length; j++) {
            if (i !== j){
            const distance = calculateDistance(circles[i], circles[j]);
            edges.push({
                from: i,
                to: j,
                distance: distance,
                pheromone: 0.2
            });
        }
        }
    }
}

// Находит дистанцию между двумя точками
function calculateDistance(point1, point2) {
    return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

// Рисование вершин графа
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

// Рисоание ребер графа
function drawLines() {
    edges.forEach(function(edge) {
        ctx.beginPath();
        ctx.moveTo(circles[edge.from].x, circles[edge.from].y);
        ctx.lineTo(circles[edge.to].x, circles[edge.to].y);
        ctx.strokeStyle = 'rgba(102, 106, 134,0.5)';
        ctx.stroke();
    });
}

// Сброс графа
function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    circles = [];
    edges = [];
    counter = 1;
    document.getElementById('pathDistance').innerText = 'Distance: 0';
}

let path = [];
let edgesNew = [];
let visited = [];
let stop = false;
let alpha = 1;
let beta = 1;
let p = 0.36;
let q = 4;

function antsAlgo()
{
    let iter = 1;
    
    edgesNew = [];
    for (let i = 0; i < edges.length; i++)
    {
        edgesNew.push({from: edges[i].from, to: edges[i].to, distance: 200 / edges[i].distance, pheromone: 0.2})
    }

    while (!stop)
    {
        path = [];
        for (let m = 0; m < circles.length; m++)
        {
            path[m] = [];
            visited = [];
            for (let i = 0; i < circles.length; i++)
            {
                visited.push(false);
            }

            findPath(m, m);
        }

        updatePheromone();
        iter++;

        if (iter === 1000)
        {
            ctx.beginPath();
            ctx.moveTo(circles[path[0][0].from].x, circles[path[0][0].from].y);
            for (let i = 0; i < path.length; i++) {
                ctx.lineTo(circles[path[0][i].from].x, circles[path[0][i].from].y);
            }
            ctx.lineTo(circles[path[0][0].from].x, circles[path[0][0].from].y);
            ctx.strokeStyle = 'rgb(255, 0, 0)';
            ctx.stroke();
            break;
        }
    }
}

// Обновление феромонов
function updatePheromone()
{
    // Испарение феромонов
    for (let i = 0; i < edges.length; i++)
    {
        edgesNew[i].pheromone *= (1 - p);
    }

    // Добавление феромонов
    for (let m = 0; m < circles.length; m++)
    {
        let pathDist = 0
        for (let i = 0; i < path[m].length; i++)
        {
            pathDist += path[m][i].distance;
        }

        for (let i = 0; i < path[m].length; i++)
        {
            for (let j = 0; j < edgesNew.length; j++)
            {
                if (edgesNew[j].from === path[m][i].from && edgesNew[j].to === path[m][i].to)
                {
                    edgesNew[j].pheromone += q / pathDist;
                }
            }
        }
    }

    // Перекрашивание графа в соответвствии с количестом феромонов на ребрах
    edgesNew.forEach(function(edge) {
        ctx.beginPath();
        ctx.moveTo(circles[edge.from].x, circles[edge.from].y);
        ctx.lineTo(circles[edge.to].x, circles[edge.to].y);

        ctx.moveTo(circles[edge.from].x + 1, circles[edge.from].y + 1);
        ctx.lineTo(circles[edge.to].x + 1, circles[edge.to].y + 1);

        ctx.moveTo(circles[edge.from].x - 1, circles[edge.from].y - 1);
        ctx.lineTo(circles[edge.to].x - 1, circles[edge.to].y - 1);

        ctx.strokeStyle = 'rgba(0, 0, 255, ' + 0.5 * edge.pheromone + ')';
        ctx.stroke();
    });
}

function findPath(curPoint, startPoint)
{
    for (let i = 0; i < circles.length; i++)
    {
        visited[curPoint] = true;
        path[startPoint].push({});
        path[startPoint][i].from = curPoint;

        let nextPoint = nextVertex(curPoint);
        path[startPoint][i].to = nextPoint;

        path[startPoint][i].distance = findDist(path[startPoint][i].from, path[startPoint][i].to);

        curPoint = nextPoint;
    }

    path[startPoint][path[startPoint].length - 1].to = path[startPoint][0].from;
    path[startPoint][path[startPoint].length - 1].distance = findDist(path[startPoint][path[startPoint].length - 1].from, path[startPoint][path[startPoint].length - 1].to);
}

// Расстояние между двумя точкками в пути
function findDist(point1, point2)
{
    for (let i = 0; i < edges.length; i++)
    {
        if (edges[i].from === point1 && edges[i].to === point2)
        {
            return edges[i].distance;
        }
    }
}

// Расчитываем вероятность того, что муравей пойдет в определенную вершину
function nextVertex(curPoint)
{
    let probabilities = [];

    // Расщитываем желание муравья идти к определенной вершине
    let totalDesire = 0;
    for (let i = 0; i < edgesNew.length; i++)
    {
        if (edgesNew[i].from === curPoint && !visited[edgesNew[i].to])
        {
            totalDesire += edgesNew[i].distance ** beta * edgesNew[i].pheromone ** alpha;
            probabilities.push({vertex: edgesNew[i].to});
        }
    }

    for (let i = 0; i < probabilities.length; i++)
    {
        for (let j = 0; j < edgesNew.length; j++)
        {
            if (edgesNew[j].from === curPoint && edgesNew[j].to === probabilities[i].vertex)
            {
                probabilities[i].chance = edgesNew[j].distance ** beta * edgesNew[j].pheromone ** alpha / totalDesire;
            }
        }
    }

    // Испытываем удачу
    let rand = Math.random();

    for (let i = 0; i < probabilities.length; i++)
    {
        let sum = 0;

        for (let j = 0; j <= i; j++)
        {
            sum += probabilities[j].chance;
        }

        if (sum >= rand)
        {
            return probabilities[i].vertex;
        }
    }
}