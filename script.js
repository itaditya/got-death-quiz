const store = {
  deaths: [],
  score: 0,
  question: {},
};

function setDeaths(deaths) {
  store.deaths = deaths;
  return deaths;
}

function setQuestion(question) {
  store.question = question;
  return question;
}

function incrementScore() {
  const newScore = store.score + 1;
  store.score = newScore;

  return newScore;
}

function ajaxGetDeaths() {
  return new Promise((resolve, reject) => {
    fetch('/deaths.json').then(async res => {
      const deaths = await res.json();
      resolve(deaths);
    }).catch(reject);
  })
}

function getCharDiedBefore(compareCharIndex) {
  const { deaths } = store;

  const randomCharIndex = Math.floor(Math.random() * compareCharIndex);

  return deaths[randomCharIndex];
}

function getCharDiedAfter(compareCharIndex) {
  const { deaths } = store;

  const numDeaths = deaths.length;
  const randomCharIndex = Math.floor(Math.random() * (numDeaths - compareCharIndex)) + compareCharIndex - 1;

  return deaths[randomCharIndex];
}

function getRandomQuestion() {
  const { deaths } = store;
  const numDeaths = deaths.length;

  /* never give the first person who died and the last person who died.
  This is done to ensure that both options are not correct.
  */
  const randomCompareCharIndex = Math.floor(Math.random() * numDeaths) + 1;

  const compareChar = deaths[randomCompareCharIndex];

  const deathTime = Math.random() >= 0.5 ? 'after' : 'before';

  const charDiedBefore = getCharDiedBefore(randomCompareCharIndex);
  const charDiedAfter = getCharDiedAfter(randomCompareCharIndex);

  const answer = deathTime === 'before' ? charDiedBefore : charDiedAfter;

  return {
    deathTime,
    compareChar,
    charDiedBefore,
    charDiedAfter,
    answer,
  };
}

function handleClickOption(event) {
  const { question } = store;

  const selectedOptionElem = event.target;
  const selectedOptionText = event.target.innerText;

  if (!selectedOptionElem.classList.contains('js-option')) {
    return;
  }

  const isCorrect = selectedOptionText === question.answer;
  // const isCorrect = true;

  const buttonClass = isCorrect ? 'is-option-correct' : 'is-option-incorrect';
  selectedOptionElem.classList.add(buttonClass);

  if (!isCorrect) {
    endGame();
    return;
  }

  incrementScore();
  const newScore = store.score;

  document.querySelector('.js-streak').innerText = newScore;

  setTimeout(() => {
    playGame();
  }, 300);
}

function renderQuestion() {
  const { question } = store;
  document.querySelector('.js-death-time').innerText = question.deathTime;
  document.querySelector('.js-death-character').innerText = question.compareChar;

  const buttonElems = document.querySelectorAll('.js-option');

  const randomNum = Math.random();

  const optionAIndex = randomNum >= 0.5 ? 1 : 0;
  const optionBIndex = randomNum >= 0.5 ? 0 : 1;

  buttonElems.forEach(elem => {
    elem.classList.remove('is-option-correct');
    elem.classList.remove('is-option-incorrect');
  });

  buttonElems[optionAIndex].innerText = question.charDiedBefore;
  buttonElems[optionBIndex].innerText = question.charDiedAfter;
}

function endGame() {
  console.log('game ended');
  const clear1 = document.querySelectorAll('.js-options-list');
  clear1.forEach(elem => {
    elem.className='is-hidden1';
  })
  const clear2 = document.querySelectorAll('.js-quiz-question'); 
  clear2.forEach(elem => {
    elem.className='is-hidden1';
  })
  const gametext = document.querySelectorAll('.is-hidden2'); 
  gametext.forEach(elem => {
    elem.className='end-text';
  })
}


function playGame() {
  const question = getRandomQuestion();
  setQuestion(question);

  // console.log('answer', question.answer); // aditodo remove this

  renderQuestion();
}

async function init() {
  const deaths = await ajaxGetDeaths();
  setDeaths(deaths);
  playGame();

  document.querySelector('.js-options-list').addEventListener('click', (event) => {
    handleClickOption(event);
  });
}

init();
