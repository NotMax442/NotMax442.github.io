// ==========================================================================
// QUIZ & STUDY RUNNER LOGIC (quiz.html)
// ==========================================================================

let sessionConfig = null;
let questions = [];
let userAnswers = [];
let currentQuestionIndex = 0;
let userScore = 0;
let studyAnsweredCount = 0;
let isSessionActive = true; // Set active immediately on page load

let timerInterval = null;
let timeRemaining = 3600;
let autoScrollTimer = null;

document.addEventListener('DOMContentLoaded', async () => {
  const rawConfig = sessionStorage.getItem('activeSessionConfig');
  if (!rawConfig) {
    window.location.href = 'index.html';
    return;
  }

  sessionConfig = JSON.parse(rawConfig);
  setupNavigationGuards();
  await initSession();
});

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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

// Navigation Guard Modal for Leave Prevention
function showLeaveConfirmModal() {
  return new Promise((resolve) => {
    const modal = document.getElementById('leave-confirm-modal');
    const confirmBtn = document.getElementById('leave-confirm-btn');
    const cancelBtn = document.getElementById('leave-cancel-btn');

    if (!modal) return resolve(true);
    modal.classList.remove('hidden');

    const handleConfirm = () => { cleanup(); resolve(true); };
    const handleCancel = () => { cleanup(); resolve(false); };

    function cleanup() {
      modal.classList.add('hidden');
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
    }

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
  });
}

function setupNavigationGuards() {
  // 1. Push initial guard state into history stack
  try {
    history.pushState({ guard: true }, '', window.location.href);
  } catch (e) {}

  // 2. Intercept Browser Back Button / Mobile Back Swipe (mouse/touch popstate)
  window.addEventListener('popstate', (e) => {
    if (isSessionActive) {
      try {
        history.pushState({ guard: true }, '', window.location.href);
      } catch (err) {}

      showLeaveConfirmModal().then((wantsToLeave) => {
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = 'index.html';
        }
      });
    }
  });

  // 3. Intercept Keyboard Shortcuts for Back (Alt + Left Arrow / Cmd + [)
  window.addEventListener('keydown', async (e) => {
    const isAltBack = e.altKey && (e.key === 'ArrowLeft' || e.code === 'ArrowLeft');
    const isCmdBack = (e.metaKey || e.ctrlKey) && e.key === '[';

    if (isSessionActive && (isAltBack || isCmdBack)) {
      e.preventDefault();
      e.stopPropagation();

      const wantsToLeave = await showLeaveConfirmModal();
      if (wantsToLeave) {
        isSessionActive = false;
        window.location.href = 'index.html';
      }
    }
  });

  // 4. Intercept Top Navbar Nav Links
  const navGuards = document.querySelectorAll('.nav-leave-guard');
  navGuards.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const targetUrl = link.getAttribute('href');
      if (isSessionActive) {
        const wantsToLeave = await showLeaveConfirmModal();
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = targetUrl;
        }
      } else {
        window.location.href = targetUrl;
      }
    });
  });

  // 5. Intercept Built-In Back Button
  const quitBtn = document.getElementById('quit-session-btn');
  if (quitBtn) {
    quitBtn.addEventListener('click', async () => {
      if (isSessionActive) {
        const wantsToLeave = await showLeaveConfirmModal();
        if (wantsToLeave) {
          isSessionActive = false;
          window.location.href = 'index.html';
        }
      } else {
        window.location.href = 'index.html';
      }
    });
  }

  // 6. Intercept Tab Close / Hard Reload / F5
  window.addEventListener('beforeunload', (e) => {
    if (isSessionActive) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

// Session Initialization
async function initSession() {
  const { year, subject, mode } = sessionConfig;
  const sessionInfo = document.getElementById('session-info');
  const loadingOverlay = document.getElementById('loading-overlay');

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${year} - ${subject} (${mode.toUpperCase()} MODE)`;
  }

  isSessionActive = true;
  userScore = 0;
  currentQuestionIndex = 0;
  studyAnsweredCount = 0;

  if (mode === 'missed') {
    const key = getStorageKey(year, subject);
    const rawMissed = localStorage.getItem(key);
    if (!rawMissed) {
      alert("No saved missed questions found for this subject!");
      window.location.href = 'index.html';
      return;
    }
    const missedList = JSON.parse(rawMissed);
    userAnswers = new Array(missedList.length).fill(null);
    questions = shuffleArray(missedList).map(q => prepareShuffledQuestion(q));
    renderStudyMode();
    return;
  }

  const filePath = `data/year${year}/${subject.toLowerCase()}.json`;
  if (loadingOverlay) loadingOverlay.classList.remove('hidden');

  try {
    const response = await fetch(`${filePath}?t=${Date.now()}`);
    if (!response.ok) throw new Error(`File not found at: ${filePath}`);
    const data = await response.json();

    let processed = shuffleArray(data.questions);
    if (mode === 'quiz') {
      processed = processed.slice(0, 60);
    }

    userAnswers = new Array(processed.length).fill(null);
    questions = processed.map(q => prepareShuffledQuestion(q));

    if (mode === 'study') {
      renderStudyMode();
    } else {
      startQuizTimer();
      renderQuizQuestion();
    }
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file exists at:\n"${filePath}"`);
    window.location.href = 'index.html';
  } finally {
    if (loadingOverlay) loadingOverlay.classList.add('hidden');
  }
}

function prepareShuffledQuestion(q) {
  const originalCorrectText = q.options[q.correctIndex];
  const shuffledOptions = shuffleArray(q.options);
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectText);

  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
}

// Timer Logic
function startQuizTimer() {
  clearInterval(timerInterval);
  timeRemaining = 3600;
  updateTimerUI();

  const timerDisplay = document.getElementById('timer-display');
  if (timerDisplay) timerDisplay.classList.remove('hidden');

  timerInterval = setInterval(() => {
    timeRemaining--;
    updateTimerUI();

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("⏱️ Time is up! Submitting your quiz now.");
      finishSession();
    }
  }, 1000);
}

function updateTimerUI() {
  const timerDisplay = document.getElementById('timer-display');
  if (!timerDisplay) return;
  const minutes = String(Math.floor(timeRemaining / 60)).padStart(2, '0');
  const seconds = String(timeRemaining % 60).padStart(2, '0');
  timerDisplay.textContent = `⏱️ ${minutes}:${seconds}`;
}

// Study Mode Renderer
function renderStudyMode() {
  window.scrollTo(0, 0);
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');

  if (progressText) progressText.textContent = `Total Questions: ${questions.length}`;
  if (questionText) questionText.textContent = '';
  if (optionsContainer) optionsContainer.innerHTML = '';
  if (nextBtn) nextBtn.classList.add('hidden');

  questions.forEach((q, qIndex) => {
    const qCard = document.createElement('div');
    qCard.classList.add('study-q-card');
    qCard.id = `q-card-${qIndex}`;
    qCard.style.cssText = 'margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-color);';

    const qTitle = document.createElement('h3');
    qTitle.textContent = `${qIndex + 1}. ${q.question}`;
    qCard.appendChild(qTitle);

    const optsDiv = document.createElement('div');
    optsDiv.classList.add('options-grid');
    optsDiv.style.cssText = 'display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;';

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
  const isCorrect = selectedIndex === q.correctIndex;

  userAnswers[qIndex] = selectedIndex;
  allBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (isCorrect) {
    selectedBtn.style.backgroundColor = '#10b981';
    selectedBtn.style.color = '#ffffff';
    userScore++;
  } else {
    selectedBtn.style.backgroundColor = '#ef4444';
    selectedBtn.style.color = '#ffffff';
    if (allBtns[q.correctIndex]) {
      allBtns[q.correctIndex].style.backgroundColor = '#10b981';
      allBtns[q.correctIndex].style.color = '#ffffff';
    }
  }

  recordQuestionResult(q, isCorrect, sessionConfig.year, sessionConfig.subject);
  studyAnsweredCount++;

  if (studyAnsweredCount === questions.length) {
    cancelAutoScroll();
    isSessionActive = false;
    setTimeout(() => finishSession(), 1200);
    return;
  }

  cancelAutoScroll();
  autoScrollTimer = setTimeout(() => {
    const nextCard = document.getElementById(`q-card-${qIndex + 1}`);
    if (nextCard) {
      nextCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 1000);
}

// Quiz Mode Renderer
function renderQuizQuestion() {
  window.scrollTo(0, 0);
  const nextBtn = document.getElementById('next-btn');
  const optionsContainer = document.getElementById('options-container');
  const progressText = document.getElementById('progress-text');
  const questionText = document.getElementById('question-text');

  if (nextBtn) nextBtn.classList.add('hidden');
  if (optionsContainer) optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  if (progressText) progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  if (questionText) questionText.textContent = q.question;

  if (nextBtn) {
    nextBtn.textContent = (currentQuestionIndex === questions.length - 1) 
      ? "Finish Quiz 🏁" 
      : "Next Question ➡️";
  }

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = optionText;

    if (userAnswers[currentQuestionIndex] === index) {
      btn.style.backgroundColor = '#0284c7';
      btn.style.borderColor = '#38bdf8';
      if (nextBtn) nextBtn.classList.remove('hidden');
    }

    btn.addEventListener('click', () => handleQuizOptionClick(index, btn));
    optionsContainer.appendChild(btn);
  });
}

function handleQuizOptionClick(selectedIndex, selectedBtn) {
  userAnswers[currentQuestionIndex] = selectedIndex;

  const optionsContainer = document.getElementById('options-container');
  const nextBtn = document.getElementById('next-btn');
  const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');

  allOptionBtns.forEach(btn => {
    btn.style.backgroundColor = 'var(--bg-subcard)';
    btn.style.borderColor = 'var(--border-sub)';
  });

  selectedBtn.style.backgroundColor = '#0284c7';
  selectedBtn.style.borderColor = '#38bdf8';

  if (nextBtn) nextBtn.classList.remove('hidden');
}

const nextBtn = document.getElementById('next-btn');
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuizQuestion();
    } else {
      finishSession();
    }
  });
}

// Session Completion Handler
function finishSession() {
  clearInterval(timerInterval);
  cancelAutoScroll();

  if (sessionConfig.mode === 'quiz') {
    userScore = 0;
    questions.forEach((q, idx) => {
      const chosen = userAnswers[idx];
      const isCorrect = chosen !== null && chosen === q.correctIndex;
      if (isCorrect) userScore++;
      recordQuestionResult(q, isCorrect, sessionConfig.year, sessionConfig.subject);
    });
  }

  isSessionActive = false;

  const lastQuizResult = {
    questions: questions,
    userAnswers: userAnswers,
    userScore: userScore,
    year: sessionConfig.year,
    subject: sessionConfig.subject,
    mode: sessionConfig.mode
  };

  sessionStorage.setItem('lastQuizResult', JSON.stringify(lastQuizResult));
  window.location.href = 'result.html';
}
