const canvas = document.getElementById('map');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
const ctx = canvas.getContext('2d');

// Реализация дерева
class TreeNode {
    constructor(value, question) {
        this.value = value;
        this.children = [];
        this.question = question;
    }
}

function findParent(start, parentVal)
{
    if (start.value === parentVal)
    {
        return start;
    }
    else
    {
        for (let i = 0; i < start.children.length; i++)
        {
            return findParent(start.children[i], parentVal);
        }
    }
}

function insert(parentVal, value, question, tree) 
{
    let node = findParent(tree, parentVal);
    let child = new TreeNode(value, question);

    if (typeof child.value === "string")
    {
        let div = document.createElement(child.value);
        document.body.append(div);
    }

    node.children.push(child);

    return node;
}

let data = [];
let tree;

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('inputRequest').addEventListener('change', inputRequest);
    document.getElementById('inputCSV').addEventListener('change', inputCSV);
    document.getElementById("startAlgo").addEventListener("click", startAlgo);
    document.getElementById('draw').addEventListener('click', visialiseTree);
});

// Создаем и рисуем дерево
function visialiseTree()
{
    tree = makeTreeStart(data);
    drawTree(tree, canvas.width / 4, canvas.height / 5 - 40, 1, 1, true);
}

// Получаем CSV файл. Вдохновился https://www.youtube.com/watch?v=oencyPPBTUQ
function inputCSV() {
    let file = this.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        var rows = text.split('\n');
        makeMatrix(rows);
    };

    reader.readAsText(file);
};

let request;

// Полчуаем запрос
function inputRequest() {
    let file = this.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        request = stringToRequest(text);
    };

    reader.readAsText(file);
};

// Преобразование из CSV в матрицу
function makeMatrix(rows)
{
    for (let i = 0; i < rows.length; i++)
    {
        rows[i] = rows[i].replace('\r', '');
        rows[i] = rows[i].split(',');
    }

    for (let i = 0; i < rows[i].length; i++)
    {
        data.push({name: rows[0][i], answers: []});
        for (let j = 1; j < rows.length; j++)
        {
            data[i].answers.push(rows[j][i]);
        }
    }
}

// Рисуем дерево
function drawTree(tree, parentCoordX, parentCoordY, siblingsQuantity, siblingNumber, firstIter)
{
    if (!firstIter)
    {
        ctx.beginPath();
        ctx.moveTo(parentCoordX, parentCoordY);
        ctx.lineTo(parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
        ctx.strokeStyle = 'rgba(102, 106, 134, 0.5)';
        ctx.stroke();
    }

    ctx.fillStyle = 'rgba(102, 106, 134, 0.8)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (firstIter)
    {
        ctx.fillText(tree.value, parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
    }
    else
    {
        ctx.fillText(tree.question + ": " + tree.value, parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
    }

    firstIter = false;

    for (let i = 0; i < tree.children.length; i++)
    {
        drawTree(tree.children[i], parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber, tree.children.length, i + 1);
    }
}

function drawPath(tree, parentCoordX, parentCoordY, siblingsQuantity, siblingNumber, firstIter, part)
{
    if (!firstIter)
    {
        ctx.beginPath();
        ctx.moveTo(parentCoordX, parentCoordY);
        ctx.lineTo(parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 0, 255, 0.8)';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (firstIter)
    {
        ctx.fillText(tree.value, parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
    }
    else
    {
        ctx.fillText(tree.question + ": " + tree.value, parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber);
    }

    firstIter = false;

    for (let i = 0; i < tree.children.length; i++)
    {
        if (tree.children[i].question === path[part])
        {
            setTimeout(() => {
                drawPath(tree.children[i], parentCoordX / siblingsQuantity * siblingNumber + parentCoordX / siblingsQuantity, parentCoordY + 40 + 15 * siblingNumber, tree.children.length, i + 1, firstIter, part + 1);
            }, 500);
        }
    }
}

let path = [];

function startAlgo()
{
    solve(tree, request, 0);
    drawPath(tree, canvas.width / 4, canvas.height / 5 - 40, 1, 1, true, 0);
    console.log(path);
}

function solve(tree, request, part)
{
    if (tree.children.length === 0)
    {
        return;
    }

    while (request[part].name !== tree.value)
    {
        part++;
    }

    for (let i = 0; i < tree.children.length; i++)
    {
        if (tree.children[i].question === request[part].question)
        {
            path.push(tree.children[i].question);
            solve(tree.children[i], request, part + 1);
        }
    }
}

function stringToRequest(str)
{
    let element = "";
    let arr = [];
    for (let i = 0; i < str.length; i++)
    {
        if (str[i] === ",")
        {
            arr.push({});
            arr[arr.length - 1].question = element;
            arr[arr.length - 1].name = data[arr.length - 1].name;
            element = "";
            continue;
        }

        element += str[i];
    }

    arr.push({});
    arr[arr.length - 1].question = element;
    arr[arr.length - 1].name = data[arr.length - 1].name;

    return arr;
}

function makeTreeStart(data)
{
    let column = findBiggeestGainRatio(calcRatio(data));
    var tree = new TreeNode(data[column].name, "");
    let questions = findQuestions(data, column);

    for (let i = 0; i < questions.length; i++)
    {
        let dataNew = cutTable(data, column, questions[i]);
        insert(data[column].name, dataNew, questions[i], tree);
        if (typeof dataNew !== "string")
        {
            makeTreeContinue(tree, dataNew, dataNew);
        }
    }

    return tree;
}

function makeTreeContinue(tree, data, parentValue)
{
    let parent = findParent(tree, parentValue);
    let column = findBiggeestGainRatio(calcRatio(data));
    parent.value = data[column].name;
    let questions = findQuestions(data, column);

    for (let i = 0; i < questions.length; i++)
    {
        let dataNew = cutTable(data, column, questions[i]);
        insert(parent.value, dataNew, questions[i], tree);
        if (typeof dataNew !== "string")
        {
            makeTreeContinue(tree, dataNew, dataNew);
        }
    }
}

function findQuestions(data, column)
{
    let questions = []

    for (let i = 0; i < data[column].answers.length; i++)
    {
        let taken = false;
        for (let j = 0; j < questions.length; j++)
        {
            if (data[column].answers[i] === questions[j])
            {
                taken = true;
            }
        }

        if (!taken)
        {
            questions.push(data[column].answers[i]);
        }
    }

    return questions;
}

// Алгоритм C4.5
function findAnswersQuantity(t, data)
{
    let answers = [];

    for (let i = 0; i < data[t].answers.length; i++)
    {
        let index = whichIndex(answers, data[t].answers[i]);
        if (index === -1)
        {
            answers.push({quantity: 1});
            answers[answers.length - 1].answer = data[t].answers[i];
        }
        else
        {
            answers[index].quantity++;
        }
    }

    return answers;
}

function whichIndex(answers, value)
{
    for (let i = 0; i < answers.length; i++)
    {
        if (value === answers[i].answer)
        {
            return i;
        }
    }

    return -1;
}

function entropyInfoT(t, data)
{
    let answers = findAnswersQuantity(t, data);
    let res = 0;

    for (let i = 0; i < answers.length; i++)
    {
        res -= answers[i].quantity / data[t].answers.length * Math.log2(answers[i].quantity / data[t].answers.length);
    }

    return res;
}

function findConnection(answer, a, t, data)
{
    let connection = [];

    for (let i = 0; i < data[a].answers.length; i++)
    {
        if (data[a].answers[i] === answer)
        {
            let index = whichIndex(connection, data[t].answers[i]);
            if (index === -1)
            {
                connection.push({quantity: 1});
                connection[connection.length - 1].answer = data[t].answers[i];
            }
            else
            {
                connection[index].quantity++;
            }
        }
    }

    return connection;
}

function entropyInfoTA(t, a, data)
{
    let answersA = findAnswersQuantity(a, data);

    let resTotal = 0;
    for (let i = 0; i < answersA.length; i++)
    {
        let res = 0;
        let connection = findConnection(answersA[i].answer, a, t, data);
        for (let j = 0; j < connection.length; j++)
        {
            res -= connection[j].quantity / answersA[i].quantity * Math.log2(connection[j].quantity / answersA[i].quantity);
        }
        res *= answersA[i].quantity / data[a].answers.length;
        resTotal += res;
    }

    return resTotal;
}

function informationGain(a, t, data)
{
    return entropyInfoT(t, data) - entropyInfoTA(t, a, data);
}

function gainRatio(a, t, data)
{
    return informationGain(a, t, data) / entropyInfoT(a, data);
}

function calcRatio(data)
{
    let ratios = [];
    for (let i = 0; i < data.length - 1; i++)
    {
        ratios.push(gainRatio(i, data.length - 1, data));
    }

    return ratios;
}

function findBiggeestGainRatio(ratios)
{
    let maxiValue = 0;
    let maxiIndex = -1
    for (let i = 0; i < ratios.length; i++)
    {
        if (ratios[i] > maxiValue)
        {
            maxiValue = ratios[i];
            maxiIndex = i;
        }
    }

    return maxiIndex;
}

function cutTable(data, column, criterion)
{
    let dataNew = [];
    for (let i = 0; i < data.length; i++)
    {
        if (i !== column)
        {
            dataNew.push({});
            dataNew[dataNew.length - 1].name = data[i].name;
            dataNew[dataNew.length - 1].answers = [];
        }
    }

    for (let i = 0; i < data[column].answers.length; i++)
    {
        if (data[column].answers[i] === criterion)
        {
            for (let j = 0, dataIndex = 0; j < dataNew.length; j++, dataIndex++)
            {
                if (j === column)
                {
                    dataIndex++;
                }

                dataNew[j].answers.push(data[dataIndex].answers[i]);
            }
        }
    }

    if (isGood(dataNew))
    {
        return dataNew[dataNew.length - 1].answers[0];
    }

    return dataNew;
}

function isGood(data)
{
    for (let i = 0; i < data[data.length - 1].answers.length - 1; i++)
    {
        if (data[data.length - 1].answers[i] !== data[data.length - 1].answers[i + 1])
        {
            return false;
        }
    }

    return true;
}