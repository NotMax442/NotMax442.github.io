// ==========================================================================
// HOME PAGE LOGIC (home.js)
// ==========================================================================

// Nested Data Hierarchy: Major -> Year -> Semester -> Subject -> [Professors]
const manifestData = {
  "MED": {
    "1": { "1": {}, "2": {} },
    "2": { 
      "1": {
        "ANATOMIE": [
          "Pr. Ung Chan",
          "Pr. Sin Sagata",
          "Pr. Nhem Aklinn",
          "Pr. Mam Bunsocheat",
          "Pr. Lim Taing & Dr. Meng Sok",
          "Pr. Ich Khuy",
          "Dr. Say Tang"
        ]
      }, 
      "2": {} 
    },
    "3": { "1": {}, "2": {} },
    "4": { "1": {}, "2": {} },
    "5": { "1": {}, "2": {} },
    "6": { "1": {}, "2": {} }
  }
};
let currentMajor = null;
let currentYear = null;
let currentSemester = null;
let currentSubject = null;

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  restoreLastView();

  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {}
});

function showScreen(screenId) {
  const screens = ['landing-screen', 'major-screen', 'year-screen', 'semester-screen', 'subject-screen', 'professor-screen'];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (id === screenId) el.classList.remove('hidden');
      else el.classList.add('hidden');
    }
  });
}

function setupNavigation() {
  const enterStudyBtn = document.getElementById('enter-study-btn');
  const backToLandingBtn = document.getElementById('back-to-landing-btn');
  const backToMajorsBtn = document.getElementById('back-to-majors-btn');
  const backToYearsBtn = document.getElementById('back-to-years-btn');
  const backToSemestersBtn = document.getElementById('back-to-semesters-btn');
  const backToSubjectsBtn = document.getElementById('back-to-subjects-btn');

  // Landing -> Major
  if (enterStudyBtn) {
    enterStudyBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      showScreen('major-screen');
    });
  }

  // Major -> Landing
  if (backToLandingBtn) {
    backToLandingBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'landing');
      sessionStorage.removeItem('lastActiveMajor');
      showScreen('landing-screen');
    });
  }

  // Select Major -> Show Years
  document.querySelectorAll('#major-grid .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentMajor = card.getAttribute('data-major');
      sessionStorage.setItem('lastActiveMajor', currentMajor);
      sessionStorage.setItem('lastView', 'year');
      showYears(currentMajor);
    });
  });

  // Year -> Major
  if (backToMajorsBtn) {
    backToMajorsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'major');
      sessionStorage.removeItem('lastActiveYear');
      showScreen('major-screen');
    });
  }

  // Select Year -> Show Semesters
  document.querySelectorAll('#year-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentYear = card.getAttribute('data-year');
      sessionStorage.setItem('lastActiveYear', currentYear);
      sessionStorage.setItem('lastView', 'semester');
      showSemesters(currentMajor, currentYear);
    });
  });

  // Semester -> Year
  if (backToYearsBtn) {
    backToYearsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'year');
      sessionStorage.removeItem('lastActiveSemester');
      showYears(currentMajor);
    });
  }

  // Select Semester -> Show Subjects
  document.querySelectorAll('#semester-screen .year-card').forEach(card => {
    card.addEventListener('click', () => {
      currentSemester = card.getAttribute('data-semester');
      sessionStorage.setItem('lastActiveSemester', currentSemester);
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester);
    });
  });

  // Subject -> Semester
  if (backToSemestersBtn) {
    backToSemestersBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'semester');
      sessionStorage.removeItem('lastActiveSubject');
      showSemesters(currentMajor, currentYear);
    });
  }

  // Professor -> Subject
  if (backToSubjectsBtn) {
    backToSubjectsBtn.addEventListener('click', () => {
      sessionStorage.setItem('lastView', 'subject');
      showSubjects(currentMajor, currentYear, currentSemester);
    });
  }
}

function restoreLastView() {
  const savedView = sessionStorage.getItem('lastView');
  currentMajor = sessionStorage.getItem('lastActiveMajor');
  currentYear = sessionStorage.getItem('lastActiveYear');
  currentSemester = sessionStorage.getItem('lastActiveSemester');
  currentSubject = sessionStorage.getItem('lastActiveSubject');

  if (savedView === 'professor' && currentMajor && currentYear && currentSemester && currentSubject) {
    showProfessors(currentMajor, currentYear, currentSemester, currentSubject);
  } else if (savedView === 'subject' && currentMajor && currentYear && currentSemester) {
    showSubjects(currentMajor, currentYear, currentSemester);
  } else if (savedView === 'semester' && currentMajor && currentYear) {
    showSemesters(currentMajor, currentYear);
  } else if (savedView === 'year' && currentMajor) {
    showYears(currentMajor);
  } else if (savedView === 'major') {
    showScreen('major-screen');
  } else {
    showScreen('landing-screen');
  }
}

function showYears(major) {
  showScreen('year-screen');
  const title = document.getElementById('selected-major-title');
  if (title) title.textContent = getTranslation('title_select_year', { major });
}

function showSemesters(major, year) {
  showScreen('semester-screen');
  const title = document.getElementById('selected-year-title');
  if (title) title.textContent = getTranslation('title_select_semester', { major, year });
}

function showSubjects(major, year, semester) {
  showScreen('subject-screen');
  const title = document.getElementById('selected-subject-screen-title');
  if (title) title.textContent = getTranslation('title_subjects', { major, year, semester });

  const subjectList = document.getElementById('subject-list');
  if (!subjectList) return;
  subjectList.innerHTML = '';

  const subjects = manifestData[major]?.[year]?.[semester] 
    ? Object.keys(manifestData[major][year][semester]) 
    : [];

  subjects.forEach(subject => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <h3>${subject}</h3>
      <p style="color:var(--text-sub); font-size:0.85rem; margin-bottom: 0;">${getTranslation('click_select_prof')}</p>
    `;

    const triggerSelect = () => {
      currentSubject = subject;
      sessionStorage.setItem('lastActiveSubject', currentSubject);
      sessionStorage.setItem('lastView', 'professor');
      showProfessors(major, year, semester, subject);
    };

    card.addEventListener('click', triggerSelect);
    subjectList.appendChild(card);
  });
}

function showProfessors(major, year, semester, subject) {
  showScreen('professor-screen');
  const title = document.getElementById('selected-prof-screen-title');
  if (title) title.textContent = getTranslation('title_select_prof', { subject });

  const profList = document.getElementById('professor-list');
  if (!profList) return;
  profList.innerHTML = '';

  const professors = manifestData[major]?.[year]?.[semester]?.[subject] || [];

  professors.forEach(prof => {
    const profSlug = prof.toLowerCase().replace(/\s+/g, '-');
    const storageKey = (typeof getStorageKey === 'function')
      ? getStorageKey(major, year, semester, subject, prof)
      : `missed_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;

    const savedMissed = localStorage.getItem(storageKey);
    const missedCount = savedMissed ? JSON.parse(savedMissed).length : 0;

    const studyKey = `saved_study_${major.toLowerCase()}_y${year}_s${semester}_${subject.toLowerCase()}_${profSlug}`;
    const savedStudyRaw = localStorage.getItem(studyKey);
    let studyProgress = null;
    if (savedStudyRaw) { try { studyProgress = JSON.parse(savedStudyRaw); } catch(e) {} }

    let continueBtnHTML = '';
    let studyBtnLabel = getTranslation('btn_study_all');

    if (studyProgress && studyProgress.studyAnsweredCount > 0) {
      const answered = studyProgress.studyAnsweredCount;
      const total = studyProgress.questions ? studyProgress.questions.length : 0;
      if (answered < total) {
        const continueText = getTranslation('btn_continue_study', { answered, total });
        continueBtnHTML = `<button class="btn primary-btn" style="background:#10b981; margin-bottom:0.5rem;" onclick="continueStudySession('${prof}')">${continueText}</button>`;
        studyBtnLabel = getTranslation('btn_restart_study');
      }
    }

    const card = document.createElement('div');
    card.classList.add('subject-card', 'prof-card');
    card.innerHTML = `
      <h3>${prof}</h3>
      ${missedCount > 0 ? `<p class="missed-badge">${getTranslation('missed_badge', { count: missedCount })}</p>` : ''}
      <div class="subject-actions">
        ${continueBtnHTML}
        <button class="btn study-btn" onclick="startSession('${prof}', 'study')">${studyBtnLabel}</button>
        <button class="btn quiz-btn" onclick="startSession('${prof}', 'quiz')">${getTranslation('btn_quiz')}</button>
      </div>
      ${missedCount > 0 ? `
        <button class="btn study-missed-btn" onclick="startMissedSession('${prof}')">${getTranslation('btn_review_missed')}</button>
        <button class="btn clear-btn" onclick="clearSavedMissed('${prof}')">${getTranslation('btn_clear_missed')}</button>
      ` : ''}
    `;
    profList.appendChild(card);
  });
}

function startSession(profName, mode) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: mode,
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function continueStudySession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: 'study',
    resume: true
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function startMissedSession(profName) {
  const sessionConfig = {
    major: currentMajor,
    year: currentYear,
    semester: currentSemester,
    subject: currentSubject,
    professor: profName,
    mode: 'missed',
    resume: false
  };
  sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
  window.location.href = '/quiz';
}

function clearSavedMissed(profName) {
  const profSlug = profName.toLowerCase().replace(/\s+/g, '-');
  const key = (typeof getStorageKey === 'function')
    ? getStorageKey(currentMajor, currentYear, currentSemester, currentSubject, profName)
    : `missed_${currentMajor.toLowerCase()}_y${currentYear}_s${currentSemester}_${currentSubject.toLowerCase()}_${profSlug}`;

  localStorage.removeItem(key);
  showProfessors(currentMajor, currentYear, currentSemester, currentSubject);
}
