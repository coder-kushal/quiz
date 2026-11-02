// BASE_URL = "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple"

const start = document.querySelector("#start");
const seeAnswers = document.querySelector("#seeAnswers");
const form = document.querySelector("form");

const initial = document.querySelector(".initial");
const quesCont = document.querySelector(".quesCont");
const result = document.querySelector(".result");
const correctAnswerCont = document.querySelector(".correctAnswers");

const inputBox = document.querySelector("input");
const difficultyBox = document.querySelector("#difficulty");
const categoryBox = document.querySelector("#category");

const ques = document.querySelector("#question");
let quesIndex = -1;

const questions = [];
const options = [];
const choosedOptions = [];
let timer;

form.addEventListener("submit", (evt) => {
    evt.preventDefault();
    startQuiz();
})

function decode(str) {
    const t = document.createElement("textarea");
    t.innerHTML = str;
    return t.value;
}

const startQuiz = async () => {
    const input = inputBox.value;
    const difficulty = difficultyBox.value;
    const category = categoryBox.value;
    const url = `https://opentdb.com/api.php?amount=${input}${category !== "any" ? `&category=${category}` : ""}${difficulty !== "any" ? `&difficulty=${difficulty}` : ""}&type=multiple`;
    start.innerHTML = "Loading..."
    start.disabled = true;
    let response, datas;
    let controller = new AbortController();
    try {
        timer = setTimeout(() => {
            controller.abort();
        }, 15000)
        response = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        if (!response.ok) throw new Error("Error");
        datas = await response.json();
        if (datas.response_code !== 0) throw new Error("Error");
    }
    catch (err) {
        clearTimeout(timer);
        alert("Couldn't load the questions. May be server problem or check your internet connection and try again...");
        start.innerHTML = "Start"
        start.disabled = false;
        return;
    }
    for (const data of datas["results"]) {
        console.log(data)
        const question = decode(data.question);
        questions.push(question);
        const option = [decode(data.correct_answer), decode(data.incorrect_answers[0]), decode(data.incorrect_answers[1]), decode(data.incorrect_answers[2])];
        options.push(option);
    }
    initial.classList.add("hidden");
    quesCont.classList.remove("hidden");
    displayNewQuestion();
}

function displayNewQuestion() {
    quesIndex++;
    if (quesIndex + 1 === questions.length) {
        document.querySelector(".next").innerText = "Submit";
    }
    if (quesIndex + 1 > questions.length) {
        submitAnswers();
        return;
    }
    ques.textContent = `${quesIndex + 1}. ${questions[quesIndex]}`;
    let tem = [0, 1, 2, 3];
    while (tem.length !== 0) {
        let index = Math.floor(Math.random() * tem.length);
        let value = tem[index];
        tem.splice(index, 1);
        document.querySelector(`#option${4 - tem.length}`).textContent = options[quesIndex][value];
    }
}

document.querySelectorAll(".option").forEach(op => {
    op.addEventListener("click", () => {
        document.querySelector(".selected")?.classList.remove("selected");
        op.classList.add("selected");
    })
})

document.querySelector(".next").addEventListener("click", () => {
    const selected = document.querySelector(".selected")
    if (!selected) {
        alert("Choose an option first!")
        return;
    }
    choosedOptions.push(selected.textContent);
    displayNewQuestion();
    selected.classList.remove("selected");
});

document.querySelector(".quit").addEventListener("click", submitAnswers)

function submitAnswers() {
    quesCont.classList.add("hidden");
    result.classList.remove("hidden");
    let score = 0;
    const totalScore = questions.length;
    for (let i = 0; i < choosedOptions.length; i++) {
        if (choosedOptions[i] == options[i][0]) score++;
    }
    document.querySelector("#finalResult").textContent = `Congratulations! You scored ${score} out of ${totalScore}.`;
}

seeAnswers.addEventListener("click", () => {
    result.classList.add("hidden");
    correctAnswerCont.classList.remove("hidden");
    correctAnswerCont.innerHTML = "";
    for (let i = 0; i < questions.length; i++) {
        let h3 = document.createElement("h3");
        let p1 = document.createElement("p");
        let p2 = document.createElement("p");
        h3.textContent = `${i + 1}. ${questions[i]}`;
        p1.textContent = `Correct Answer: ${options[i][0]}`;
        choosedOptions.length > i ? p2.textContent = `Your Answer: ${choosedOptions[i]}` : "";
        correctAnswerCont.append(h3,p1);
        if (p2.textContent !== "") correctAnswerCont.append(p2);
    }
    let btn = document.createElement("button");
    btn.id = "playAgainBtn";
    btn.innerText = "Play Again";
    correctAnswerCont.append(btn);
    document.querySelector("#playAgainBtn").addEventListener("click", () => {
        correctAnswerCont.classList.add("hidden");
        initial.classList.remove("hidden");
    })
    start.disabled = false;
    start.innerText = "Start";
    quesIndex = -1;
    questions.length = 0;
    options.length = 0;
    choosedOptions.length = 0;
    document.querySelector(".next").innerText = "Next";
    document.querySelector(".selected")?.classList.remove("selected");
})
