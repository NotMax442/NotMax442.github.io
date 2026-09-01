// Select DOM Elements
const screens = document.querySelectorAll('.screen');
const enterStudyBtn = document.getElementById('enter-study-btn');
const yearCards = document.querySelectorAll('.year-card');
const backButtons = document.querySelectorAll('.back-btn');
const selectedYearTitle = document.getElementById('selected-year-title');

// Store active selection state
let currentYear = null;

// Core Function: Hides all screens, then reveals the targeted screen ID
function navigateTo(screenId) {
  screens.forEach(screen => screen.classList.add('hidden'));
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  }
}

// Step 1: Landing Page -> Click "Study" -> Year Selection Page
enterStudyBtn.addEventListener('click', () => {
  navigateTo('year-screen');
});

// Step 2: Click a Year (1-6) -> Subject Selection Page
yearCards.forEach(card => {
  card.addEventListener('click', () => {
    currentYear = card.getAttribute('data-year');
    
    // Update the heading dynamically
    selectedYearTitle.textContent = `Year ${currentYear} Subjects`;
    
    // Move to screen 3
    navigateTo('subject-screen');
  });
});

// Step 3: Handle all "Back" buttons dynamically using data-target attribute
backButtons.forEach(button => {
  button.addEventListener('click', () => {
    const targetScreenId = button.getAttribute('data-target');
    navigateTo(targetScreenId);
  });
});
