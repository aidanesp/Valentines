const screens = {
  welcome: document.getElementById('welcome-screen'),
  quiz: document.getElementById('quiz-screen'),
  result: document.getElementById('result-screen'),
  valentine: document.getElementById('valentine-screen'),
  letter: document.getElementById('letter-screen'),
};

const continueBtn = document.getElementById('continue-btn');
const startBtn = document.getElementById('start-btn');
const questionCounter = document.getElementById('question-counter');
const questionText = document.getElementById('question-text');
const choicesEl = document.getElementById('choices');
const scoreText = document.getElementById('score-text');
const nextBtn = document.getElementById('next-btn');
const resultCopy = document.getElementById('result-copy');
const revealBtn = document.getElementById('reveal-btn');
const yesBtn = document.getElementById('yes-btn');
const noBtn = document.getElementById('no-btn');
const celebrateText = document.getElementById('celebrate-text');
const heartsLayer = document.getElementById('hearts-layer');
const rulesModal = document.getElementById('rules-modal');
const FLOATING_HEART_IMAGE = 'heart.png';
const fireworksCanvas = document.getElementById('fireworks-canvas');
const fireworksCtx = fireworksCanvas.getContext('2d');
const cinematicTransition = document.getElementById('cinematic-transition');
const cinematicText = document.getElementById('cinematic-text');
const valentineCelebration = document.getElementById('valentine-celebration');
const fireworksNextBtn = document.getElementById('fireworks-next-btn');
const loveLetterText = document.getElementById('love-letter-text');
const letterSignature = document.getElementById('letter-signature');

const questions = [
  {
    emoji: '🍨',
    q: 'What ice cream did I really want to try on our first date?',
    choices: ['Vanilla', 'Strawberry', 'Chocolate', 'Ketchup'],
    answer: 3,
  },
  {
    emoji: '🐧🐧',
    q: "When is Pophie and Paedan's birthday?",
    choices: ['July 8th', 'July 9th', 'July 19th', 'August 9th'],
    answer: 1,
  },
  {
    emoji: '🍝',
    q: 'At what restaurant did you meet my parents?',
    choices: ["Isabelle's", "Jinzikaya", "Gyubee", "Ennio's"],
    answer: 3,
  },
  {
    emoji: '🧟🎬',
    q: 'What movie were we watching when I first said I love you?',
    choices: ['Insidious', 'The Nun', 'Hereditary', 'The Conjuring'],
    answer: 3,
  },
  {
    emoji: '👩‍❤️‍👨',
    q: 'Who do you love the most?',
    choices: ['Aidan', 'Aidan', 'Aidan', 'Aidan'],
    answer: 0,
  },
];

let currentQuestion = 0;
let score = 0;
let selectedChoice = null;
let restartTimer = null;
let fireworksRaf = null;
let fireworksBurstTimer = null;
let rockets = [];
let sparks = [];
let penguins = [];
let noMoveLocked = false;
let letterTypeTimer = null;

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  if (letterTypeTimer) {
    clearTimeout(letterTypeTimer);
    letterTypeTimer = null;
  }

  if (screenName === 'letter') {
    document.body.classList.add('letter-mode');
  } else {
    document.body.classList.remove('letter-mode');
  }

  if (screenName !== 'valentine') {
    document.body.classList.remove('finale-mode');
    screens.valentine.classList.remove('celebrating');
    valentineCelebration.setAttribute('aria-hidden', 'true');
    stopFireworksSequence();
  }

  if (screenName !== 'letter') {
    loveLetterText.textContent = '';
    letterSignature.classList.remove('visible');
  }

  screens[screenName].classList.add('active');
  if (screenName === 'letter') {
    startLetterReveal();
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function playValentineTransition() {
  cinematicTransition.classList.add('active');
  cinematicTransition.setAttribute('aria-hidden', 'false');
  cinematicText.textContent = '';

  await wait(500);
  cinematicText.textContent = '3';
  await wait(700);
  cinematicText.textContent = '2';
  await wait(700);
  cinematicText.textContent = '1';
  await wait(700);
  cinematicText.textContent = 'RELEASE EM';
  await wait(900);

  showScreen('valentine');
  document.body.classList.add('finale-mode');
  screens.valentine.classList.remove('celebrating');
  valentineCelebration.setAttribute('aria-hidden', 'true');
  yesBtn.disabled = false;
  noBtn.disabled = false;
  resetNoButtonPosition();
  spawnHeartBurst(20);

  await wait(550);
  cinematicTransition.classList.remove('active');
  cinematicTransition.setAttribute('aria-hidden', 'true');
  cinematicText.textContent = '';
}

function renderQuestion() {
  const current = questions[currentQuestion];
  selectedChoice = null;

  questionCounter.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;
  questionText.textContent = `${current.emoji} ${current.q}`;
  choicesEl.innerHTML = '';
  nextBtn.disabled = true;

  current.choices.forEach((choice, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn choice';
    btn.type = 'button';
    btn.textContent = choice;
    btn.addEventListener('click', () => selectChoice(idx, btn));
    choicesEl.appendChild(btn);
  });
}

function resetQuiz() {
  score = 0;
  currentQuestion = 0;
  selectedChoice = null;
  scoreText.textContent = 'Score: 0';
  renderQuestion();
  showScreen('quiz');
}

function selectChoice(idx, btn) {
  if (selectedChoice !== null) {
    return;
  }

  selectedChoice = idx;
  const correctIdx = questions[currentQuestion].answer;
  const allChoices = [...choicesEl.querySelectorAll('.choice')];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isCorrect = isLastQuestion || idx === correctIdx;

  allChoices.forEach((c) => (c.disabled = true));

  btn.classList.add('selected');
  if (isCorrect) {
    score += 1;
    btn.classList.add('correct');
  } else {
    btn.classList.add('wrong');
    allChoices[correctIdx].classList.add('correct');
    nextBtn.disabled = true;
    restartTimer = setTimeout(() => {
      resetQuiz();
      restartTimer = null;
    }, 900);
    return;
  }

  scoreText.textContent = `Score: ${score}`;
  nextBtn.disabled = false;
}

function finishQuiz() {
  const percentage = Math.round((score / questions.length) * 100);
  let message = `You scored ${score}/${questions.length} (${percentage}%). `;

  if (percentage === 100) {
    message += 'Certified love expert status unlocked.';
  } else if (percentage >= 60) {
    message += 'Great vibes. You clearly understood the assignment.';
  } else {
    message += 'Still adorable. Love is about effort anyway.';
  }

  resultCopy.textContent = message;
  showScreen('result');
}

function spawnHeartBurst(count = 18) {
  for (let i = 0; i < count; i += 1) {
    const heart = document.createElement('span');
    const fallbackEmoji = ['💙', '🩵', '🤍', '✨'][Math.floor(Math.random() * 4)];
    const heartSize = FLOATING_HEART_IMAGE
      ? `${4.8 + Math.random() * 3.6}rem`
      : `${0.9 + Math.random() * 1.4}rem`;
    heart.className = 'heart';
    heart.style.setProperty('--heart-size', heartSize);

    if (FLOATING_HEART_IMAGE) {
      const img = document.createElement('img');
      img.className = 'heart-pic';
      img.src = FLOATING_HEART_IMAGE;
      img.alt = '';
      img.addEventListener('error', () => {
        heart.textContent = fallbackEmoji;
      });
      heart.appendChild(img);
    } else {
      heart.textContent = fallbackEmoji;
    }

    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.animationDuration = FLOATING_HEART_IMAGE
      ? `${6.5 + Math.random() * 3.5}s`
      : `${3.8 + Math.random() * 2.6}s`;
    heart.style.animationDelay = `${Math.random() * 0.25}s`;
    heartsLayer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 7000);
  }
}

function moveNoButton() {
  if (noMoveLocked) {
    return;
  }
  noMoveLocked = true;
  setTimeout(() => {
    noMoveLocked = false;
  }, 170);

  const container = noBtn.parentElement;
  const padding = 10;
  noBtn.classList.add('evading');
  const minPreferredX = Math.min(
    container.clientWidth * 0.58,
    container.clientWidth - noBtn.offsetWidth - padding
  );
  const maxX = Math.max(padding, container.clientWidth - noBtn.offsetWidth - padding);
  const maxY = Math.max(padding, container.clientHeight - noBtn.offsetHeight - padding);
  const minX = Math.max(padding, minPreferredX);
  const x = minX + Math.random() * Math.max(1, maxX - minX);
  const y = padding + Math.random() * (maxY - padding);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
  noBtn.style.transform = 'none';
}

function resetNoButtonPosition() {
  noBtn.classList.remove('evading');
  noBtn.style.left = '';
  noBtn.style.top = '';
  noBtn.style.transform = 'none';
}

function startLetterReveal() {
  const fullText = loveLetterText.dataset.fullText || '';
  let idx = 0;
  loveLetterText.textContent = '';
  letterSignature.classList.remove('visible');

  const typeNext = () => {
    if (idx >= fullText.length) {
      letterSignature.classList.add('visible');
      letterTypeTimer = null;
      return;
    }

    loveLetterText.textContent += fullText[idx];
    const char = fullText[idx];
    idx += 1;

    let delay = 42;
    if (char === '.' || char === '!' || char === '?') {
      delay = 280;
    } else if (char === ',') {
      delay = 150;
    } else if (char === ' ') {
      delay = 28;
    }

    letterTypeTimer = setTimeout(typeNext, delay);
  };

  typeNext();
}

function resizeFireworksCanvas() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}

function makeExplosion(x, y) {
  const colors = ['#7ec3ff', '#91e3ff', '#ffffff', '#66a7ff', '#a6ccff'];

  for (let i = 0; i < 64; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.8 + Math.random() * 4.4;
    sparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 70 + Math.floor(Math.random() * 28),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 1.6 + Math.random() * 2.8,
    });
  }

  for (let i = 0; i < 10; i += 1) {
    penguins.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 3.6,
      vy: -3.8 - Math.random() * 2.2,
      life: 95 + Math.floor(Math.random() * 35),
      size: 18 + Math.random() * 14,
      spin: (Math.random() - 0.5) * 0.2,
      rotation: Math.random() * Math.PI * 2,
    });
  }
}

function launchRocket() {
  rockets.push({
    x: Math.random() * fireworksCanvas.width,
    y: fireworksCanvas.height + 10,
    targetY: 80 + Math.random() * (fireworksCanvas.height * 0.45),
    vy: 5.4 + Math.random() * 2.1,
  });
}

function drawFireworksFrame() {
  fireworksCtx.fillStyle = 'rgba(2, 4, 10, 0.24)';
  fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

  rockets = rockets.filter((rocket) => {
    rocket.y -= rocket.vy;
    fireworksCtx.fillStyle = '#a8d6ff';
    fireworksCtx.beginPath();
    fireworksCtx.arc(rocket.x, rocket.y, 2.1, 0, Math.PI * 2);
    fireworksCtx.fill();

    if (rocket.y <= rocket.targetY) {
      makeExplosion(rocket.x, rocket.y);
      return false;
    }
    return true;
  });

  sparks = sparks.filter((spark) => {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.vy += 0.04;
    spark.vx *= 0.988;
    spark.vy *= 0.988;
    spark.life -= 1;

    if (spark.life <= 0) {
      return false;
    }

    fireworksCtx.globalAlpha = Math.max(0, spark.life / 100);
    fireworksCtx.fillStyle = spark.color;
    fireworksCtx.beginPath();
    fireworksCtx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
    fireworksCtx.fill();
    fireworksCtx.globalAlpha = 1;
    return true;
  });

  penguins = penguins.filter((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.vx *= 0.992;
    p.life -= 1;
    p.rotation += p.spin;

    if (p.life <= 0) {
      return false;
    }

    fireworksCtx.save();
    fireworksCtx.globalAlpha = Math.max(0, p.life / 120);
    fireworksCtx.translate(p.x, p.y);
    fireworksCtx.rotate(p.rotation);
    fireworksCtx.font = `${p.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    fireworksCtx.textAlign = 'center';
    fireworksCtx.fillText('🐧', 0, 0);
    fireworksCtx.restore();
    fireworksCtx.globalAlpha = 1;
    return true;
  });

  fireworksRaf = requestAnimationFrame(drawFireworksFrame);
}

function stopFireworksSequence() {
  if (fireworksRaf) {
    cancelAnimationFrame(fireworksRaf);
    fireworksRaf = null;
  }
  if (fireworksBurstTimer) {
    clearInterval(fireworksBurstTimer);
    fireworksBurstTimer = null;
  }
  fireworksCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}

function startFireworksSequence() {
  stopFireworksSequence();
  rockets = [];
  sparks = [];
  penguins = [];
  resizeFireworksCanvas();
  fireworksCtx.fillStyle = '#02040a';
  fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  screens.valentine.classList.add('celebrating');
  valentineCelebration.setAttribute('aria-hidden', 'false');

  for (let i = 0; i < 4; i += 1) {
    launchRocket();
  }

  fireworksBurstTimer = setInterval(() => {
    launchRocket();
    if (Math.random() > 0.5) {
      launchRocket();
    }
  }, 220);

  drawFireworksFrame();
}

continueBtn.addEventListener('click', () => {
  rulesModal.classList.add('open');
  rulesModal.setAttribute('aria-hidden', 'false');
});

startBtn.addEventListener('click', () => {
  if (restartTimer) {
    clearTimeout(restartTimer);
    restartTimer = null;
  }
  rulesModal.classList.remove('open');
  rulesModal.setAttribute('aria-hidden', 'true');
  resetQuiz();
  spawnHeartBurst(12);
});

nextBtn.addEventListener('click', () => {
  if (selectedChoice === null) {
    return;
  }

  currentQuestion += 1;
  if (currentQuestion >= questions.length) {
    finishQuiz();
    return;
  }

  renderQuestion();
});

revealBtn.addEventListener('click', () => {
  playValentineTransition();
});

yesBtn.addEventListener('click', () => {
  celebrateText.textContent = '';
  yesBtn.disabled = true;
  noBtn.disabled = true;
  startFireworksSequence();
});

fireworksNextBtn.addEventListener('click', () => {
  stopFireworksSequence();
  showScreen('letter');
});

noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButton();
});
noBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  moveNoButton();
});
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
});

window.addEventListener('resize', () => {
  resetNoButtonPosition();
  if (screens.valentine.classList.contains('celebrating')) {
    resizeFireworksCanvas();
  }
});

setInterval(() => {
  if (screens.letter.classList.contains('active')) {
    return;
  }
  if (Math.random() > 0.45) {
    spawnHeartBurst(4);
  }
}, 3200);
