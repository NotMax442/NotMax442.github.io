// ==========================================================================
// HOME PAGE LOGIC (index.html)
// ==========================================================================

let currentYear = null;

document.addEventListener('DOMContentLoaded', () => {
  const yearCards = document.querySelectorAll('.year-card');
  const subjectScreen = document.getElementById('subject-screen');
  const yearScreen = document.getElementById('year-screen');
  const backToYearsBtn = document.getElementById('back-to-years-btn');

  const savedYear = sessionStorage.getItem('lastYear');
  if (savedYear) {
    currentYear = savedYear;
    showSubjects(currentYear);
  }

  yearCards.forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastYear', currentYear);
      showSubjects(currentYear);
    });
  });

  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      if (subjectScreen) subjectScreen.classList.add('hidden');
      if (yearScreen) yearScreen.classList.remove('hidden');
      sessionStorage.removeItem('lastYear');
    });
  }
});

function showSubjects(year) {
  const yearScreen = document.getElementById('year-screen');
  const subjectScreen = document.getElementById('subject-screen');
  const selectedYearTitle = document.getElementById('selected-year-title');

  if (yearScreen) yearScreen.classList.add('hidden');
  if (subjectScreen) subjectScreen.classList.remove('hidden');

  const t = translations[currentLang] || translations.en;
  if (selectedYearTitle) {
    selectedYearTitle.textContent = t.subjects_header 
      ? t.subjects_header.replace('{year}', year) 
      : `Year ${year} Subjects`;
  }

  loadSubjectsForYear(year);
}

function loadSubjectsForYear(year) {
  const subjectList = document.getElementById('subject-list');
  if (!subjectList) return;

  subjectList.innerHTML = '';
  const subjects = manifestData[year] || [];
  const t = translations[currentLang] || translations.en;

  subjects.forEach(subject => {
    const storageKey = getStorageKey(year, subject);
    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    const subjectCard = document.createElement('div');
    subjectCard.classList.add('subject-card');

    const badgeText = t.missed_badge 
      ? t.missed_badge.replace('{count}', missedCount) 
      : `⚠️ ${missedCount} saved missed question(s)`;

    subjectCard.innerHTML = `
      <h3>${subject}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${badgeText}</p>` : ''}
      
      <div class="subject-actions">
        <button class="btn study-btn" onclick="startSession('${subject}', 'study')">${t.btn_study_all}</button>
        <button class="btn quiz-btn" onclick="startSession('${subject}', 'quiz')">${t.btn_quiz}</button>
      </div>

      ${missedCount > 0 ? `
        <button class="btn study-missed-btn" onclick="startMissedSession('${subject}')">${t.btn_review_missed} (${missedCount})</button>
        <button class="btn clear-btn" onclick="clearSavedMissed('${subject}')">${t.btn_clear_missed}</button>
      ` : ''}
    `;
    
    subjectList.appendChild(subjectCard);
  });
}

function startSession(subjectName, mode) {
  const sessionConfig = {
    year: currentYear,
    subject: subjectName,
    mode: mode
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
}

function startMissedSession(subjectName) {
  const sessionConfig = {
    year: currentYear,
    subject: subjectName,
    mode: 'missed'
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = 'quiz.html';
}

function clearSavedMissed(subjectName) {
  const key = getStorageKey(currentYear, subjectName);
  localStorage.removeItem(key);
  loadSubjectsForYear(currentYear);
}
