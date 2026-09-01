// DOM Element Selectors
const screens = document.querySelectorAll('.screen');
const enterStudyBtn = document.getElementById('enter-study-btn');
const yearCards = document.querySelectorAll('.year-card');
const backButtons = document.querySelectorAll('.back-btn');
const selectedYearTitle = document.getElementById('selected-year-title');
const subjectList = document.getElementById('subject-list');

// App State
let currentYear = null;

// Temporary manifest data mapping years to available subjects
const manifestData = {
  "1": ["I-D-A", "MED-PRO", "F-N-S"],
  "2": ["Physiology", "Pathology", "Microbiology"],
  "3": ["Pharmacology", "Internal Medicine"],
  "4": ["Pediatrics", "Surgery"],
  "5": ["Obstetrics", "Gynecology"],
  "6": ["Advanced Pathology", "Clinical Rotations"]
};

// --- Navigation Logic ---

// Core Function: Hides all screens and reveals the target screen
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

// --- Subject & Session Logic ---

// Generates cards with separate Study and Quiz buttons
function loadSubjectsForYear(year) {
  subjectList.innerHTML = ''; // Clear existing cards
  
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

// Launches Study or Quiz Mode for the chosen subject
function startSession(subjectName, mode) {
  console.log(`Starting ${mode} mode for ${subjectName} in Year ${currentYear}`);
  
  const sessionInfo = document.getElementById('session-info');
  if (sessionInfo) {
    sessionInfo.textContent = `Year ${currentYear} - ${subjectName} (${mode.toUpperCase()} MODE)`;
  }
  
  navigateTo('quiz-screen');
}
