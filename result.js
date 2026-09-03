// ==========================================================================
// RESULTS & REVIEW BREAKDOWN LOGIC (result.html)
// ==========================================================================

let resultData = null;
let currentReviewFilter = 'wrong';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Read saved quiz results from sessionStorage
  const rawResult = sessionStorage.getItem('lastQuizResult');
  if (!rawResult) {
    window.location.href = '/';
    return;
  }

  // Populate global resultData
  resultData = JSON.parse(rawResult);

  const totalQuestions = resultData.questions ? resultData.questions.length : 0;
  const correctCount = resultData.userScore || 0;
  const incorrectCount = totalQuestions - correctCount;

  // 2. Trigger the Pie Chart & Counter Animation
  animatePieChartAndCounters(correctCount, incorrectCount, totalQuestions);

  renderScoreSummary();
  setupFilterControls();
  renderReviewBreakdown();
  checkMissedQuestions();
  setupActionButtons();

  // Natural AdSense Push execution on page load
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch (e) {
    // Suppress error if adblocker is active
  }
});

function renderScoreSummary() {
  const { questions, userScore } = resultData;
  const finalScore = document.getElementById('final-score');
  const scorePercentageEl = document.getElementById('score-percentage');
  const progressBarFillEl = document.getElementById('progress-bar-fill');

  const total = questions ? questions.length : 0;
  const percentage = total > 0 ? Math.round((userScore / total) * 100) : 0;

  if (finalScore) {
    finalScore.textContent = `You answered ${userScore} out of ${total} questions correctly!`;
  }

  if (scorePercentageEl) {
    scorePercentageEl.textContent = `${percentage}%`;
  }

  if (progressBarFillEl) {
    progressBarFillEl.style.width = '0%';
    setTimeout(() => {
      progressBarFillEl.style.width = `${percentage}%`;
    }, 150);
  }
}

function setupFilterControls() {
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');

  if (filterWrongBtn) {
    filterWrongBtn.addEventListener('click', () => {
      currentReviewFilter = 'wrong';
      renderReviewBreakdown();
    });
  }

  if (filterAllBtn) {
    filterAllBtn.addEventListener('click', () => {
      currentReviewFilter = 'all';
      renderReviewBreakdown();
    });
  }
}

function renderReviewBreakdown() {
  const reviewContainer = document.getElementById('review-container');
  const filterWrongBtn = document.getElementById('filter-wrong-btn');
  const filterAllBtn = document.getElementById('filter-all-btn');

  if (!reviewContainer) return;
  reviewContainer.innerHTML = '';

  // Update button active states
  if (filterWrongBtn && filterAllBtn) {
    if (currentReviewFilter === 'wrong') {
      filterWrongBtn.className = 'btn primary-btn';
      filterAllBtn.className = 'btn secondary-btn';
    } else {
      filterWrongBtn.className = 'btn secondary-btn';
      filterAllBtn.className = 'btn primary-btn';
    }
  }

  const { questions, userAnswers } = resultData;
  const itemsToDisplay = [];

  questions.forEach((q, idx) => {
    const userChoiceIdx = userAnswers[idx];
    const isCorrect = userChoiceIdx !== null && userChoiceIdx === q.correctIndex;

    if (currentReviewFilter === 'all' || !isCorrect) {
      itemsToDisplay.push({ q, idx, userChoiceIdx, isCorrect });
    }
  });

  if (itemsToDisplay.length === 0 && currentReviewFilter === 'wrong') {
    reviewContainer.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 1.5rem;">
        <p style="margin: 0; color: #10b981; font-weight: 600;">🎉 Perfect score! You answered all questions correctly!</p>
      </div>
    `;
    return;
  }

  itemsToDisplay.forEach(({ q, idx, userChoiceIdx, isCorrect }) => {
    const card = document.createElement('div');
    card.classList.add('review-card', isCorrect ? 'correct' : 'incorrect');
    card.style.cssText = `
      padding: 1rem;
      border-radius: 8px;
      background: var(--bg-subcard);
      border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};
      border-top: 1px solid var(--border-sub);
      border-right: 1px solid var(--border-sub);
      border-bottom: 1px solid var(--border-sub);
    `;

    const userChoiceText = (userChoiceIdx !== null && userChoiceIdx !== undefined)
      ? q.options[userChoiceIdx]
      : "⚠️ Unanswered / Skipped";

    card.innerHTML = `
      <h4 style="margin: 0 0 0.5rem 0; color: var(--text-main); font-size: 1rem; line-height: 1.4;">${idx + 1}. ${q.question}</h4>
      <p style="margin: 0 0 0.25rem 0; font-size: 0.9rem; color: ${isCorrect ? '#10b981' : '#ef4444'}; font-weight: 600;">
        <strong>Your Choice:</strong> ${userChoiceText} ${isCorrect ? '✓' : '✗'}
      </p>
      ${!isCorrect ? `
        <p style="margin: 0; font-size: 0.9rem; color: #10b981; font-weight: 600;">
          <strong>Correct Choice:</strong> ${q.options[q.correctIndex]}
        </p>
      ` : ''}
    `;

    reviewContainer.appendChild(card);
  });
}

function checkMissedQuestions() {
  const { year, subject } = resultData;
  const retryMissedBtn = document.getElementById('retry-missed-btn');
  const missedCountEl = document.getElementById('missed-count');

  const key = (typeof getStorageKey === 'function') ? getStorageKey(year, subject) : `missed_y${year}_${subject.toLowerCase()}`;
  const savedMissed = localStorage.getItem(key);
  const missedList = savedMissed ? JSON.parse(savedMissed) : [];

  if (missedList.length > 0) {
    if (missedCountEl) missedCountEl.textContent = missedList.length;
    if (retryMissedBtn) retryMissedBtn.classList.remove('hidden');
  } else {
    if (retryMissedBtn) retryMissedBtn.classList.add('hidden');
  }
}

function setupActionButtons() {
  const retryMissedBtn = document.getElementById('retry-missed-btn');
  const restartBtn = document.getElementById('restart-btn');

  if (retryMissedBtn) {
    retryMissedBtn.addEventListener('click', () => {
      const sessionConfig = {
        year: resultData.year,
        subject: resultData.subject,
        mode: 'missed'
      };
      sessionStorage.setItem('activeSessionConfig', JSON.stringify(sessionConfig));
      window.location.href = '/quiz';
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      window.location.href = '/';
    });
  }
}

function animatePieChartAndCounters(correct, incorrect, total) {
  const CIRCUMFERENCE = 251.327; // 2 * Math.PI * 40
  const correctRatio = total > 0 ? correct / total : 0;
  const incorrectRatio = total > 0 ? incorrect / total : 0;

  const correctPct = Math.round(correctRatio * 100);
  const incorrectPct = Math.round(incorrectRatio * 100);

  const correctArc = document.getElementById('correct-arc');
  const incorrectArc = document.getElementById('incorrect-arc');

  const centerPercentEl = document.getElementById('center-percent');
  const correctCountEl = document.getElementById('correct-count-display');
  const correctPercentEl = document.getElementById('correct-percent-display');
  const incorrectCountEl = document.getElementById('incorrect-count-display');
  const incorrectPercentEl = document.getElementById('incorrect-percent-display');

  // Align incorrect arc start position to end of correct arc
  const correctAngleDegrees = correctRatio * 360;
  if (incorrectArc) {
    incorrectArc.setAttribute('transform', `rotate(${correctAngleDegrees} 50 50)`);
  }

  const phase1Duration = 1000; // 1.0s for green arc
  const phase2Duration = 800;  // 0.8s for red arc

  let startTime = null;

  // --- Phase 1: Draw Green Arc & Count Correct Stats ---
  function runPhase1(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / phase1Duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentCorrectCount = Math.floor(easeProgress * correct);
    const currentCorrectPct = Math.floor(easeProgress * correctPct);
    const currentCorrectOffset = CIRCUMFERENCE - (easeProgress * (CIRCUMFERENCE * correctRatio));

    if (correctArc) correctArc.style.strokeDashoffset = currentCorrectOffset;
    if (centerPercentEl) centerPercentEl.textContent = `${currentCorrectPct}%`;
    if (correctCountEl) correctCountEl.textContent = currentCorrectCount;
    if (correctPercentEl) correctPercentEl.textContent = `${currentCorrectPct}%`;

    if (progress < 1) {
      requestAnimationFrame(runPhase1);
    } else {
      // Snap to exact final totals at end of Phase 1
      if (correctArc) correctArc.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * correctRatio);
      if (centerPercentEl) centerPercentEl.textContent = `${correctPct}%`;
      if (correctCountEl) correctCountEl.textContent = correct;
      if (correctPercentEl) correctPercentEl.textContent = `${correctPct}%`;

      // Start Phase 2 if there are incorrect answers
      if (incorrect > 0) {
        startTime = null;
        requestAnimationFrame(runPhase2);
      }
    }
  }

  // --- Phase 2: Draw Red Arc & Count Incorrect Stats ---
  function runPhase2(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / phase2Duration, 1);

    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentIncorrectCount = Math.floor(easeProgress * incorrect);
    const currentIncorrectPct = Math.floor(easeProgress * incorrectPct);
    const currentIncorrectOffset = CIRCUMFERENCE - (easeProgress * (CIRCUMFERENCE * incorrectRatio));

    if (incorrectArc) incorrectArc.style.strokeDashoffset = currentIncorrectOffset;
    if (incorrectCountEl) incorrectCountEl.textContent = currentIncorrectCount;
    if (incorrectPercentEl) incorrectPercentEl.textContent = `${currentIncorrectPct}%`;

    if (progress < 1) {
      requestAnimationFrame(runPhase2);
    } else {
      // Snap to exact final totals at end of Phase 2
      if (incorrectArc) incorrectArc.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * incorrectRatio);
      if (incorrectCountEl) incorrectCountEl.textContent = incorrect;
      if (incorrectPercentEl) incorrectPercentEl.textContent = `${incorrectPct}%`;
    }
  }

  requestAnimationFrame(runPhase1);
}
