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
const lessonBox = document.getElementById('lesson-box');
const lessonText = document.getElementById('lesson-text');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScore = document.getElementById('final-score');

// App State
let currentYear = null;
let currentSubject = '';
let currentMode = 'study';
let questions = [];
let currentQuestionIndex = 0;
let userScore = 0;
let selectedOptionIndex = null;

// Temporary manifest data mapping years to available subjects
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

// --- Navigation Logic ---
function navigateTo(screenId) {
  screens.forEach(screen => screen.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

// 1. Landing Screen -> Click "Study Now" -> Year Screen
enterStudyBtn.addEventListener('click', () => {
  navigateTo('year-screen');
});

// 2. Year Cards -> Select Year -> Load Subjects & Open Subject Screen
yearCards.forEach(card => {
  card.addEventListener('click', () => {
    currentYear = card.getAttribute('data-year');
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    
    loadSubjectsForYear(currentYear);
    navigateTo('subject-screen');
  });
});

// 3. Dynamic Back Buttons
backButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetScreenId = button.getAttribute('data-target');
    navigateTo(targetScreenId);
  });
});

if (restartBtn) {
  restartBtn.addEventListener('click', () => navigateTo('year-screen'));
}

// --- Subject & Session Logic ---

// Generates cards with separate Study and Quiz buttons
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

// Launches Study or Quiz Mode for the chosen subject & fetches questions
async function startSession(subjectName, mode) {
  currentSubject = subjectName;
  currentMode = mode;
  currentQuestionIndex = 0;
  userScore = 0;

  if (sessionInfo) {
    sessionInfo.textContent = `Year ${currentYear} - ${subjectName} (${mode.toUpperCase()} MODE)`;
  }

  // Constructs path: data/year-1/i-d-a.json
  const filePath = `data/year${currentYear}/${subjectName.toLowerCase()}.json`;

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`File not found at: ${filePath}`);
    }
    const data = await response.json();

    // 1. Shuffle question order
    questions = shuffleArray(data.questions).map(q => {
      // 2. Shuffle option order while keeping track of original correct answer
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
    renderQuestion();
  } catch (error) {
    alert(`Could not load questions!\nMake sure your file is placed at:\n"${filePath}"`);
    console.error(error);
  }
}

// --- Render Question Logic ---
function renderQuestion() {
  selectedOptionIndex = null;
  lessonBox.classList.add('hidden');
  nextBtn.classList.add('hidden');
  optionsContainer.innerHTML = '';

  const q = questions[currentQuestionIndex];
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionText.textContent = q.question;

  q.options.forEach((optionText, index) => {
    const btn = document.createElement('button');
    btn.classList.add('option-btn');
    btn.textContent = optionText;
    btn.addEventListener('click', () => handleOptionClick(index, btn));
    optionsContainer.appendChild(btn);
  });
}

// --- Answer Handling Logic ---
function handleOptionClick(selectedIndex, selectedBtn) {
  if (selectedOptionIndex !== null) return; // Lock choices once clicked
  selectedOptionIndex = selectedIndex;

  const q = questions[currentQuestionIndex];
  const allOptionBtns = optionsContainer.querySelectorAll('.option-btn');

  // Disable further clicks on all choices
  allOptionBtns.forEach(btn => btn.style.pointerEvents = 'none');

  if (selectedIndex === q.correctIndex) {
    selectedBtn.style.backgroundColor = '#10b981'; // Green
    selectedBtn.style.color = '#ffffff';
    userScore++;
  } else {
    selectedBtn.style.backgroundColor = '#ef4444'; // Red
    selectedBtn.style.color = '#ffffff';
    
    // Highlight the correct answer in green
    allOptionBtns[q.correctIndex].style.backgroundColor = '#10b981';
    allOptionBtns[q.correctIndex].style.color = '#ffffff';
  }

  // Reveal Lesson Explanation in Study Mode
  if (currentMode === 'study') {
    lessonText.textContent = q.lesson || "No explanation provided for this question.";
    lessonBox.classList.remove('hidden');
  }

  nextBtn.classList.remove('hidden');
}

// --- Next Button & Results Logic ---
if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      renderQuestion();
    } else {
      showResults();
    }
  });
}

function showResults() {
  if (finalScore) {
    finalScore.textContent = `You scored ${userScore} out of ${questions.length} (${Math.round((userScore / questions.length) * 100)}%)`;
  }
  navigateTo('result-screen');
}
