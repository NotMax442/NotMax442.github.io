// ==========================================================================
// SHARED UTILITIES, TRANSLATIONS & GLOBAL STATE
// ==========================================================================

const manifestData = {
  "1": ["I-D-A", "MED-PRO-B1", "MED-PRO", "MED-PRO-250", "I-D-A-Khmer"],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": ["MED-PRO"]
};

const translations = {
  en: {
    nav_home: "HOME",
    nav_about: "ABOUT",
    nav_contact: "CONTACT US",
    nav_account: "MY ACCOUNT",
    landing_title: "Medical Study Platform",
    landing_sub: "Select your academic year, review saved missed questions, or test your knowledge.",
    btn_start_study: "🚀 Start Studying",
    btn_cancel: "Cancel",
    btn_leave: "Leave",
    leave_modal_title: "⚠️ Leave Study Session?",
    leave_modal_desc: "Your active test progress will be lost.",
    contact_title: "Report Question Error",
    contact_notice: "Found an incorrect question or answer? Send us a report below!",
    contact_desc_label: "Description:",
    contact_submit_btn: "📤 Send Feedback",
    cooldown_alert: "⏱️ Cooldown Active:\nPlease wait {mins} minute(s) before sending feedback again.",
    btn_back: "⬅️ Back",
    account_title: "My Account & Vault",
    account_empty_vault: "🎉 Fantastic! You have 0 missed questions in your vault.",
    year_selection_title: "Select Academic Year",
    year_1: "Year 1",
    year_2: "Year 2",
    year_3: "Year 3",
    year_4: "Year 4",
    year_5: "Year 5",
    year_6: "Year 6",
    btn_back_years: "⬅️ Back to Years",
    btn_study_all: "📖 Study All",
    btn_quiz: "📝 Quiz",
    btn_review_missed: "🎯 Review Missed",
    btn_clear_missed: "🗑️ Clear Saved Missed",
    subjects_header: "Year {year} Subjects",
    missed_badge: "⚠️ {count} saved missed question(s)",
    loading_text: "Loading Questions...",
    nav_donate: "☕ Support Us",
    donate_modal_title: "☕ Support testforuhs.com",
    donate_modal_desc: "Your donations help keep the platform free, maintain servers, and add new study features!",
    btn_close: "Close",
    donate_tagline: "Every little bit is greatly appreciated! Thank you for your support 😊",
    donate_cta: "You may donate through our KHQR here."
  },
  km: {
    nav_home: "ទំព័រដើម",
    nav_about: "អំពីពួកយើង",
    nav_contact: "ទំនាក់ទំនង",
    nav_account: "គណនីខ្ញុំ",
    landing_title: "កម្មវិធីសិក្សាវេជ្ជសាស្ត្រ",
    landing_sub: "ជ្រើសរើសឆ្នាំសិក្សា រំលឹកសំណួរដែលខុស ឬប្រឡងតេស្តសមត្ថភាព។",
    btn_start_study: "🚀 ចាប់ផ្តើមសិក្សា",
    btn_cancel: "បោះបង់",
    btn_leave: "ចាកចេញ",
    leave_modal_title: "⚠️ តើអ្នកពិតជាចង់ចាកចេញឬ?",
    leave_modal_desc: "ការវិវឌ្ឍនៃការធ្វើតេស្តរបស់អ្នកនឹងត្រូវបាត់បង់។",
    contact_title: "ផ្តល់មតិត្រឡប់ / រាយការណ៍កំហុស",
    contact_notice: "តើអ្នកប្រទះឃើញសំណួរ ឬចម្លើយមិនត្រឹមត្រូវមែនទេ? សូមផ្ញើការរាយការណ៍មកកាន់យើង!",
    contact_desc_label: "ការបរិយាយ:",
    contact_submit_btn: "📤 ផ្ញើការរាយការណ៍",
    cooldown_alert: "⏱️ រយៈពេលរង់ចាំ:\nសូមរង់ចាំ {mins} នាទីទៀតមុនពេលផ្ញើម្តងទៀត។",
    btn_back: "⬅️ ត្រឡប់ក្រោយ",
    account_title: "គណនី និងឃ្លាំងសំណួររបស់ខ្ញុំ",
    account_empty_vault: "🎉 អស្ចារ្យណាស់! អ្នកគ្មានសំណួរដែលខុសនៅក្នុងឃ្លាំងទេ។",
    year_selection_title: "ជ្រើសរើសឆ្នាំសិក្សា",
    year_1: "ឆ្នាំទី ១",
    year_2: "ឆ្នាំទី ២",
    year_3: "ឆ្នាំទី ៣",
    year_4: "ឆ្នាំទី ៤",
    year_5: "ឆ្នាំទី ៥",
    year_6: "ឆ្នាំទី ៦",
    btn_back_years: "⬅️ ត្រឡប់ទៅឆ្នាំ",
    btn_study_all: "📖 សិក្សាទាំងអស់",
    btn_quiz: "📝 ប្រឡងតេស្ត",
    btn_review_missed: "🎯 រំលឹកសំណួរខុស",
    btn_clear_missed: "🗑️ លុបសំណួរខុស",
    subjects_header: "មុខវិជ្ជាឆ្នាំទី {year}",
    missed_badge: "⚠️ {count} សំណួរខុសដែលបានរក្សាទុក",
    loading_text: "កំពុងទាញយកសំណួរ...",
    nav_donate: "☕ ឧបត្ថម្ភ",
    donate_modal_title: "☕ ឧបត្ថម្ភ testforuhs.com",
    donate_modal_desc: "ការឧបត្ថម្ភរបស់លោកអ្នកជួយគាំទ្រដល់ការចំណាយលើ Server និងអភិវឌ្ឍន៍កម្មវិធីសិក្សាឱ្យនៅតែឥតគិតថ្លៃ!",
    btn_close: "បិទ",
    donate_tagline: "ទៅតាមទឹកចិត្តរបស់អ្នករៀងៗខ្លួន។ តិចឬច្រើន គឺជាការលើកទឹកចិត្តយ៉ាងធំធេង! អរគុណសម្រាប់ការគាំទ្រ 😊",
    donate_cta: "អ្នកអាចធ្វើការឧបត្ថម្ភតាមរយៈ KHQR នៅទីនេះ៖"
  }
};

let currentLang = localStorage.getItem('app_language') || 'en';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('app_language', lang);
  document.documentElement.setAttribute('lang', lang);

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });

  const langSelect = document.getElementById('language-select');
  if (langSelect) langSelect.value = lang;
}

function applyTheme(theme) {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    if (themeToggleBtn) themeToggleBtn.textContent = '☀️ Light';
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (themeToggleBtn) themeToggleBtn.textContent = '🌙 Dark';
  }
}

function getStorageKey(year, subject) {
  return `missed_y${year}_${subject.toLowerCase()}`;
}

function recordQuestionResult(questionObj, isCorrect, year, subject) {
  const key = getStorageKey(year, subject);
  const raw = localStorage.getItem(key);
  let vault = raw ? JSON.parse(raw) : [];

  const existingIndex = vault.findIndex(item => item.question === questionObj.question);

  if (!isCorrect) {
    if (existingIndex >= 0) vault[existingIndex].streak = 0;
    else vault.push({ ...questionObj, streak: 0 });
  } else if (existingIndex >= 0) {
    vault[existingIndex].streak = (vault[existingIndex].streak || 0) + 1;
    if (vault[existingIndex].streak >= 2) vault.splice(existingIndex, 1);
  }

  if (vault.length > 0) localStorage.setItem(key, JSON.stringify(vault));
  else localStorage.removeItem(key);
}

document.addEventListener('DOMContentLoaded', () => {
  setLanguage(currentLang);
  const savedTheme = localStorage.getItem('app_theme') || 'dark';
  applyTheme(savedTheme);

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => setLanguage(e.target.value));
  }

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const newTheme = isLight ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem('app_theme', newTheme);
    });
  }

  // Donate Modal Handlers
  const navDonateBtn = document.getElementById('nav-donate-btn');
  const donateModal = document.getElementById('donate-modal');
  const closeDonateBtn = document.getElementById('close-donate-btn');
  const bottomCloseDonateBtn = document.getElementById('bottom-close-donate-btn');

  if (navDonateBtn && donateModal) {
    navDonateBtn.addEventListener('click', () => donateModal.classList.remove('hidden'));
    if (closeDonateBtn) closeDonateBtn.addEventListener('click', () => donateModal.classList.add('hidden'));
    if (bottomCloseDonateBtn) bottomCloseDonateBtn.addEventListener('click', () => donateModal.classList.add('hidden'));
    donateModal.addEventListener('click', (e) => {
      if (e.target === donateModal) donateModal.classList.add('hidden');
    });
  }

  // Privacy Policy Modal Handlers
  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const privacyModal = document.getElementById('privacy-modal');
  const closePrivacyBtn = document.getElementById('close-privacy-btn');
  const bottomClosePrivacyBtn = document.getElementById('bottom-close-privacy-btn');

  if (openPrivacyBtn && privacyModal) {
    openPrivacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.remove('hidden');
    });
    if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', () => privacyModal.classList.add('hidden'));
    if (bottomClosePrivacyBtn) bottomClosePrivacyBtn.addEventListener('click', () => privacyModal.classList.add('hidden'));
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) privacyModal.classList.add('hidden');
    });
  }
});
