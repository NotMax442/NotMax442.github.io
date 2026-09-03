// ==========================================================================
// CONTACT & FEEDBACK LOGIC (contact.js)
// ==========================================================================

const WORKER_URL = 'https://telegram-proxy.pensamkhan9.workers.dev/';

document.addEventListener('DOMContentLoaded', () => {
  const feedbackForm = document.getElementById('feedback-form');
  const confirmModal = document.getElementById('contact-confirm-modal');
  const cancelBtn = document.getElementById('cancel-feedback-btn');
  const confirmBtn = document.getElementById('confirm-feedback-btn');

  renderMyFeedbacks();

  if (feedbackForm) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Check 30-minute Cooldown
      const lastSubmitTime = localStorage.getItem('last_feedback_time');
      if (lastSubmitTime) {
        const elapsedMins = (Date.now() - parseInt(lastSubmitTime, 10)) / (1000 * 60);
        if (elapsedMins < 30) {
          const remainMins = Math.ceil(30 - elapsedMins);
          const t = translations[currentLang] || translations.en;
          const alertMsg = t.cooldown_alert
            ? t.cooldown_alert.replace('{mins}', remainMins)
            : `⏱️ Cooldown Active:\nPlease wait ${remainMins} minute(s) before sending feedback again.`;
          alert(alertMsg);
          return;
        }
      }

      if (confirmModal) confirmModal.classList.remove('hidden');
    });
  }

  if (cancelBtn && confirmModal) {
    cancelBtn.addEventListener('click', () => confirmModal.classList.add('hidden'));
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      if (confirmModal) confirmModal.classList.add('hidden');
      await submitFeedback();
    });
  }
});

async function submitFeedback() {
  const feedbackText = document.getElementById('feedback-text');
  const feedbackImage = document.getElementById('feedback-image');
  const submitBtn = document.getElementById('submit-feedback-btn');

  if (!feedbackText || !feedbackText.value.trim()) return;

  const description = feedbackText.value.trim();
  let imageBase64 = null;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Sending...';
  }

  if (feedbackImage && feedbackImage.files.length > 0) {
    try {
      imageBase64 = await convertFileToBase64(feedbackImage.files[0]);
    } catch (e) {
      console.error('Failed to convert image:', e);
    }
  }

  const payload = {
    description: description,
    image: imageBase64,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Network response failed');

    saveFeedbackLocally(description, imageBase64);
    localStorage.setItem('last_feedback_time', Date.now().toString());

    feedbackText.value = '';
    if (feedbackImage) feedbackImage.value = '';
    alert('✅ Feedback submitted successfully! Thank you for helping improve TestforUHS.');
    renderMyFeedbacks();
  } catch (error) {
    // Fallback: save locally if network request fails
    saveFeedbackLocally(description, imageBase64);
    localStorage.setItem('last_feedback_time', Date.now().toString());

    feedbackText.value = '';
    if (feedbackImage) feedbackImage.value = '';
    alert('✅ Report saved locally! Thank you for your feedback.');
    renderMyFeedbacks();
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = translations[currentLang]?.contact_submit_btn || '📤 Send Feedback';
    }
  }
}

function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

function saveFeedbackLocally(description, imageBase64) {
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const list = raw ? JSON.parse(raw) : [];

  list.unshift({
    id: Date.now(),
    description: description,
    image: imageBase64,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem('my_submitted_feedbacks', JSON.stringify(list));
}

function renderMyFeedbacks() {
  const container = document.getElementById('my-feedback-list');
  if (!container) return;

  container.innerHTML = '';
  const raw = localStorage.getItem('my_submitted_feedbacks');
  const list = raw ? JSON.parse(raw) : [];

  if (list.length === 0) {
    container.innerHTML = `
      <div class="score-card" style="text-align: center; padding: 1.5rem; width: 100%;">
        <p style="margin: 0; color: var(--text-sub);">No submitted reports yet.</p>
      </div>
    `;
    return;
  }

  list.forEach((item) => {
    const card = document.createElement('div');
    card.classList.add('subject-card');
    card.style.cssText = 'text-align: left; padding: 1rem;';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <strong style="color: var(--text-main);">Reported on ${item.date}</strong>
        <span class="badge" style="background: #10b981; color: #fff; font-size: 0.75rem; padding: 2px 8px; border-radius: 4px;">Submitted</span>
      </div>
      <p style="margin: 0; color: var(--text-sub); font-size: 0.9rem; line-height: 1.4;">${escapeHTML(item.description)}</p>
      ${item.image ? `<img src="${item.image}" alt="Screenshot" style="max-width: 100%; max-height: 150px; margin-top: 0.75rem; border-radius: 6px; border: 1px solid var(--border-sub);">` : ''}
    `;

    container.appendChild(card);
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
