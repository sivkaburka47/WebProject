document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('map');
    const ctx = canvas.getContext('2d');
    let counter = 1;
    let circles = [];
    let edges = [];

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    canvas.addEventListener('click', function(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        circles.push({x: x, y: y, counter: counter});

        recalculateEdges();

        drawCircles();

        counter++;
    });

    function recalculateEdges() {
        edges = [];

        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                const distance = calculateDistance(circles[i], circles[j]);
                edges.push({
                    from: i,
                    to: j,
                    distance: distance
                });
            }
        }
    }

    function calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

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
        edges.forEach(function(edge) {
            ctx.beginPath();
            ctx.moveTo(circles[edge.from].x, circles[edge.from].y);
            ctx.lineTo(circles[edge.to].x, circles[edge.to].y);
            ctx.strokeStyle = 'rgba(102, 106, 134,0.5)';
            ctx.stroke();
        });
    }


    function displayPath(path, color = 'green') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCircles();
        ctx.beginPath();
        ctx.moveTo(circles[path[0]].x, circles[path[0]].y);
        let totalDistance = 0;
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(circles[path[i]].x, circles[path[i]].y);
            totalDistance += calculateDistance(circles[path[i-1]], circles[path[i]]);
        }
        ctx.lineTo(circles[path[0]].x, circles[path[0]].y);
        totalDistance += calculateDistance(circles[path[path.length - 1]], circles[path[0]]);
        ctx.strokeStyle = color;
        ctx.stroke();

        document.getElementById('pathDistance').innerText = `Расстояние: ${totalDistance.toFixed(2)}`;

    }

    let noBetterPathTimer;

    function findBestPath() {
        return new Promise(async resolve => {
            let population = initializePopulation(2500);
            let generations = 2500;
            let bestDistance = Infinity;
            let bestPath;

            for (let gen = 0; gen < generations; gen++) {
                let scores = evaluatePopulation(population);
                let foundNewBest = false;

                for (let i = 0; i < scores.length; i++) {
                    if (scores[i] < bestDistance) {
                        bestDistance = scores[i];
                        bestPath = population[i];
                        foundNewBest = true;
                        clearTimeout(noBetterPathTimer);
                        noBetterPathTimer = setTimeout(() => {
                            displayPath(bestPath, 'red');
                        }, 5000);
                    }
                }

                if (foundNewBest) {
                    displayPath(bestPath, 'green');
                    await new Promise(r => setTimeout(r, 300));
                }

                let selected = select(population, scores);
                let crossedOver = crossover(selected);
                population = mutate(crossedOver, 0.5);
            }

            clearTimeout(noBetterPathTimer);
            displayPath(bestPath, 'red');
            resolve();
        });
    }


    document.getElementById('findPath').addEventListener('click', async function() {
        if (circles.length > 1) {
            await findBestPath();
        }
    });

    function initializePopulation(populationSize) {
        let population = [];
        for (let i = 0; i < populationSize; i++) {
            let individual = Array.from({length: circles.length}, (v, k) => k);
            shuffleArray(individual);
            population.push(individual);
        }
        return population;
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function evaluatePopulation(population) {
        return population.map(path => {
            let distance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                distance += calculateDistance(circles[path[i]], circles[path[i + 1]]);
            }
            distance += calculateDistance(circles[path[0]], circles[path[path.length - 1]]);
            return distance;
        });
    }

    function select(population, scores) {
        let matingPool = [];
        let maxScore = Math.max(...scores);
        for (let i = 0; i < population.length; i++) {
            let fitness = 1 - (scores[i] / maxScore);
            let n = Math.floor(fitness * 100);
            for (let j = 0; j < n; j++) {
                matingPool.push(population[i]);
            }
        }
        return matingPool;
    }

    function crossover(matingPool) {
        let newPopulation = [];
        for (let i = 0; i < matingPool.length; i += 2) {
            if (i + 1 < matingPool.length) {
                let parent1 = matingPool[i];
                let parent2 = matingPool[i + 1];
                let [child1, child2] = orderedCrossover(parent1, parent2);
                newPopulation.push(child1, child2);
            }
        }
        return newPopulation;
    }

    function orderedCrossover(parent1, parent2) {
        let start = Math.floor(Math.random() * parent1.length);
        let end = Math.floor(Math.random() * (parent1.length - start)) + start;
        let child1 = fillChild(start, end, parent1, parent2);
        let child2 = fillChild(start, end, parent2, parent1);
        return [child1, child2];
    }

    function fillChild(start, end, parent1, parent2) {
        let child = new Array(parent1.length).fill(null);
        for (let i = start; i < end; i++) {
            child[i] = parent1[i];
        }
        parent2.forEach(item => {
            if (!child.includes(item)) {
                let index = child.indexOf(null);
                child[index] = item;
            }
        });
        return child;
    }

    function mutate(population, mutationRate) {
        let mutatedPopulation = population.map(individual => {
            if (Math.random() < mutationRate) {
                let index1 = Math.floor(Math.random() * individual.length);
                let index2 = (index1 + 1) % individual.length;
                [individual[index1], individual[index2]] = [individual[index2], individual[index1]];
            }
            return individual;
        });
        return mutatedPopulation;
    }

    function resetCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        circles = [];
        edges = [];
        counter = 1;
        document.getElementById('pathDistance').innerText = 'Расстояние: 0';
    }

    document.getElementById('resetMap').addEventListener('click', function() {
        resetCanvas();
    });


});
