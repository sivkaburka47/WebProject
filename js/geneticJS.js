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

    //Пересчет массива рёбер между кругами
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

    //Вычисление расстояния между двумя точками
    function calculateDistance(point1, point2) {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }

    //Отрисовка кругов
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

    //Отрисовка линий
    function drawLines() {
        edges.forEach(function(edge) {
            ctx.beginPath();
            ctx.moveTo(circles[edge.from].x, circles[edge.from].y);
            ctx.lineTo(circles[edge.to].x, circles[edge.to].y);
            ctx.strokeStyle = 'rgba(102, 106, 134,0.5)';
            ctx.stroke();
        });
    }

    //Отрисовка пути
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

        document.getElementById('pathDistance').innerText = `Distance: ${totalDistance.toFixed(2)}`;
    }

    document.getElementById('populationSize').addEventListener('input', function() {
        document.getElementById('populationSizeValue').textContent = "Population: " + this.value;
    });

    document.getElementById('generationsCount').addEventListener('input', function() {
        document.getElementById('generationsCountValue').textContent = "Generations: " + this.value;
    });

    document.getElementById('findPath').addEventListener('click', async function() {
        if (circles.length > 1) {
            const populationSize = parseInt(document.getElementById('populationSize').value, 10);
            const generationsCount = parseInt(document.getElementById('generationsCount').value, 10);
            await findBestPath(populationSize, generationsCount);
        }
    });

    //Поиск кратчайшего пути с использованием генетического алгоритма
    async function findBestPath(populationSize, generations) {
        let population = initializePopulation(populationSize);
        let bestDistance = Infinity;
        let bestPath;

        // Цикл по поколениям для оптимизации пути
        for (let gen = 0; gen < generations; gen++) {
            let scores = evaluatePopulation(population);
            for (let i = 0; i < scores.length; i++) {
                if (scores[i] < bestDistance) {
                    bestDistance = scores[i];
                    bestPath = [...population[i]];

                    displayPath(bestPath, 'green');
                    await new Promise(r => setTimeout(r, 100));
                }
            }

            population = selectNextGeneration(population, scores);
            population = crossoverPopulation(population);
            population = mutatePopulation(population, gen, generations);
        }
        displayPath(bestPath, 'red');
    }

    // Инициализация начальной популяции
    function initializePopulation(populationSize) {
        let population = [];
        for (let i = 0; i < populationSize; i++) {
            // Генерируем случайного пути
            let path = [...Array(circles.length).keys()];
            shuffleArray(path);
            population.push(path);
        }
        return population;
    }

    //Перемешивание массива
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    //Оценка популяции
    function evaluatePopulation(population) {
        return population.map(path => pathDistance(path));
    }

    //Вычисление общего расстояния пути
    function pathDistance(path) {
        let total = 0;
        // Расстояние между последовательными точками в пути
        for (let i = 0; i < path.length - 1; i++) {
            total += calculateDistance(circles[path[i]], circles[path[i + 1]]);
        }
        //Замыкаем путь
        total += calculateDistance(circles[path[path.length - 1]], circles[path[0]]);
        return total;
    }

    // Функция для выбора следующего поколения на основе оценок
    function selectNextGeneration(population, scores) {
        // Сортировка индексов на основе оценок расстояний
        let sortedIndices = scores.map((score, index) => [score, index])
            .sort((a, b) => a[0] - b[0])
            .map(pair => pair[1]);
        // Отбор лучших для следующего поколения
        return sortedIndices.slice(0, population.length).map(index => population[index]);
    }

    // Скрещивания популяции и создание нового поколения
    function crossoverPopulation(population) {
        let newPopulation = [];
        for (let i = 0; i < population.length; i += 2) {
            let parent1 = population[i];
            let parent2 = population[i + 1] || population[i]; // на случай нечетного количества
            let [child1, child2] = singlePointCrossover(parent1, parent2);
            newPopulation.push(child1, child2);
        }
        return newPopulation;
    }

    // Функция для скрещивания двух родителей с одной точкой разреза
    function singlePointCrossover(parent1, parent2) {
        let point = Math.floor(Math.random() * parent1.length);
        let child1 = createChild(parent1, parent2, point);
        let child2 = createChild(parent2, parent1, point);
        return [child1, child2];
    }

    //Создания потомка используя гены двух родителей до заданной точки разреза
    function createChild(parent1, parent2, crossoverPoint) {
        let child = [];
        // Инициализируем набор элементов из parent1 до точки разреза
        let elements = new Set(parent1.slice(0, crossoverPoint));
        //Добавляем их в потомка
        child.push(...parent1.slice(0, crossoverPoint));

        //Добавляем элементы из parent2 которых еще нету в потомке
        parent2.forEach(element => {
            if (!elements.has(element)) {
                child.push(element);
            }
        });

        return child;
    }

    //Мутация популяции
    function mutatePopulation(population) {
        const mutationRate = 0.5;
        population.forEach(path => {
            if (Math.random() < mutationRate) {
                const index1 = Math.floor(Math.random() * path.length);
                const index2 = (index1 + 1) % path.length;
                [path[index1], path[index2]] = [path[index2], path[index1]];
            }
        });
        return population;
    }
});
