// DOM Element Selectors
const screens = document.querySelectorAll('.screen');
const enterStudyBtn = document.getElementById('enter-study-btn');
const yearCards = document.querySelectorAll('.year-card');
const backButtons = document.querySelectorAll('.back-btn');
const selectedYearTitle = document.getElementById('selected-year-title');
const subjectList = document.getElementById('subject-list');

// Quiz Screen Selectors
const sessionInfo = document.getElementById('session-info');
const progressText = document.getElementById('progress-text');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScore = document.getElementById('final-score');
const timerDisplay = document.getElementById('timer-display');

// App State
let currentYear = null;
let currentSubject = '';
let currentMode = 'study';
let questions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let selectedOptionIndex = null;

// Timer & Auto-scroll State
let timerInterval = null;
let timeRemaining = 3600;
let autoScrollTimer = null;

// Manifest data mapping years to available subjects
const manifestData = {
  "1": ["I-D-A", "MED-PRO", "F-N-S"],
  "2": ["Physiology", "Pathology", "Microbiology"],
  "3": ["Pharmacology", "Internal Medicine"],
  "4": ["Pediatrics", "Surgery"],
  "5": ["Obstetrics", "Gynecology"],
  "6": ["Advanced Pathology", "Clinical Rotations"]
};

// --- Fisher-Yates Shuffle Algorithm ---
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// --- Cancel Auto-scroll on User Manual Input ---
function cancelAutoScroll() {
  if (autoScrollTimer) {
    clearTimeout(autoScrollTimer);
    autoScrollTimer = null;
  }
}

window.addEventListener('wheel', cancelAutoScroll);
window.addEventListener('touchmove', cancelAutoScroll);
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space'].includes(e.code)) {
    cancelAutoScroll();
  }
});

// --- Navigation Logic ---
function navigateTo(screenId) {
  screens.forEach(screen => screen.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

enterStudyBtn.addEventListener('click', () => navigateTo('year-screen'));

yearCards.forEach(card => {
  card.addEventListener('click', () => {
    currentYear = card.getAttribute('data-year');
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    loadSubjectsForYear(currentYear);
    navigateTo('subject-screen');
  });
});

backButtons.forEach(button => {
  button.addEventListener('click', () => {
    clearInterval(timerInterval);
    cancelAutoScroll();
    const targetScreenId = button.getAttribute('data-target');
    navigateTo(targetScreenId);
  });
});

if (restartBtn) {
  restartBtn.addEventListener('click', () => {
    clearInterval(timerInterval);
    cancelAutoScroll();
    navigateTo('year-screen');
  });
}

// --- Subject Cards ---
function loadSubjectsForYear(year) {
  subjectList.innerHTML = '';
  const subjects = manifestData[year] || [];
  
  subjects.forEach(subject => {
    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');
    
    subjectCard.innerHTML = `
      <h3>${subject}</h3>
      <div class="subject-actions">
        <button class="btn study-btn" onclick="startSession('${subject}', 'study')">📖 Study</button>
        <button class="btn quiz-btn" onclick="startSession('${subject}', 'quiz')">📝 Quiz</button>
      </div>
    `;
    
    subjectList.appendChild(subjectCard);
  });
}

// --- Timer System for Quiz Mode ---
function startQuizTimer() {
  clearInterval(timerInterval);
  timeRemaining = 3600;
  updateTimerUI();

  if (timerDisplay) timerDisplay.classList.remove('hidden');

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏱️ Time is up! Submitting your quiz now.");
      showResults();
    }
  }, 1000);
}

function updateTimerUI() {
  if (!timerDisplay) return;
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  
  const formattedMins = String(minutes).padStart(2, '0');
  const formattedSecs = String(seconds).padStart(2, '0');
  
  timerDisplay.textContent = `⏱️ ${formattedMins}:${formattedSecs}`;
}

// --- Session Initialization ---
async function startSession(subjectName, mode) {
  currentSubject = subjectName;
  currentMode = mode;
  currentQuestionIndex = 0;
  userScore = 0;
  clearInterval(timerInterval);
  cancelAutoScroll();

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${currentYear} - ${subjectName} (${mode.toUpperCase()} MODE)`;
  }

  const filePath = `data/year${currentYear}/${subjectName.toLowerCase()}.json`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`File not found at: ${filePath}`);
    const data = await response.json();

    let processedQuestions = shuffleArray(data.questions);

    if (mode === 'quiz') {
      processedQuestions = processedQuestions.slice(0, 60);
      startQuizTimer();
    } else {
      if (timerDisplay) timerDisplay.classList.add('hidden');
    }

    questions = processedQuestions.map(q => {
      const originalCorrectText = q.options[q.correctIndex];
      const shuffledOptions = shuffleArray(q.options);
      const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

      return {
        ...q,
        options: shuffledOptions,
        correctIndex: newCorrectIndex
      };
    });

    navigateTo('quiz-screen');

    if (currentMode === 'study') {
      renderStudyMode();
    } else {
      renderQuizQuestion();
    }
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file exists at:\n"${filePath}"`);
    console.error(error);
  }
}

// --- STUDY MODE (All Questions Scrollable Feed) ---
function renderStudyMode() {
  progressText.textContent = `Total Questions: ${questions.length}`;
  questionText.textContent = '';
  optionsContainer.innerHTML = '';
  if (nextBtn) nextBtn.classList.add('hidden');

  questions.forEach((q, qIndex) => {
    const qCard = document.createElement('div');
    qCard.classList.add('study-q-card');
    qCard.id = `q-card-${qIndex}`;
    qCard.style.cssText = 'margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #334155;';

    const qTitle = document.createElement('h3');
    qTitle.textContent = `${qIndex + 1}. ${q.question}`;
    qCard.appendChild(qTitle);

    const optsDiv = document.createElement('div');
    optsDiv.classList.add('options-grid');

    q.options.forEach((optText, optIndex) => {
      const btn = document.createElement('button');
      btn.classList.add('option-btn');
      btn.textContent = optText;
      btn.addEventListener('click', () => handleStudyOptionClick(qIndex, optIndex, btn, optsDiv));
      optsDiv.appendChild(btn);
    });

    qCard.appendChild(optsDiv);
    optionsContainer.appendChild(qCard);
  });
}

function handleStudyOptionClick(qIndex, selectedIndex, selectedBtn, optsDiv) {
  const q = questions[qIndex];
  const allBtns = optsDiv.querySelectorAll('.option-btn');

  allBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (selectedIndex === q.correctIndex) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    allBtns[q.correctIndex].style.backgroundColor = '#10b981';
    allBtns[q.correctIndex].style.color = '#ffffff';
  }

  // 2-second auto-scroll timer to next question
  cancelAutoScroll();
  autoScrollTimer = setTimeout(() => {
    const nextCard = document.getElementById(`q-card-${qIndex + 1}`);
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 2000);
}

// --- QUIZ MODE (Single Question Step-by-Step) ---
function renderQuizQuestion() {
  selectedOptionIndex = null;
  nextBtn.classList.add('hidden');
  optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionText.textContent = q.question;

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = optionText;
    btn.addEventListener('click', () => handleQuizOptionClick(index, btn));
    optionsContainer.appendChild(btn);
  });
}

function handleQuizOptionClick(selectedIndex, selectedBtn) {
  if (selectedOptionIndex !== null) return;
  selectedOptionIndex = selectedIndex;

  const q = questions[currentQuestionIndex];
  const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');

  allOptionBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (selectedIndex === q.correctIndex) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
    userScore++;
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    allOptionBtns[q.correctIndex].style.backgroundColor = '#10b981';
    allOptionBtns[q.correctIndex].style.color = '#ffffff';
  }

  nextBtn.classList.remove('hidden');
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      renderQuizQuestion();
    } else {
      showResults();
    }
  });
}

function showResults() {
  clearInterval(timerInterval);
  cancelAutoScroll();
  if (finalScore) {
    finalScore.textContent = `You scored ${userScore} out of ${questions.length} (${Math.round((userScore / questions.length) * 100)}%)`;
  }
  navigateTo('result-screen');
}
