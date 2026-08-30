(() => {
  const root = document.documentElement;
  const buttons = document.querySelectorAll('[data-language]');
  const copyButton = document.querySelector('.copy-command');
  const queryLanguage = new URLSearchParams(window.location.search).get('lang');
  const storedLanguage = localStorage.getItem('harness-site-language');

  function setLanguage(language) {
    const isEnglish = language === 'en';
    root.lang = isEnglish ? 'en' : 'zh-CN';
    document.body.classList.toggle('english', isEnglish);
    buttons.forEach((button) => {
      const active = button.dataset.language === (isEnglish ? 'en' : 'zh');
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.title = isEnglish ? 'Harness Check | Make Agent work reviewable' : 'Harness Check | 让 Agent 工作经得起复查';
    localStorage.setItem('harness-site-language', isEnglish ? 'en' : 'zh');
  }

  setLanguage(queryLanguage === 'en' || storedLanguage === 'en' ? 'en' : 'zh');

  buttons.forEach((button) => button.addEventListener('click', () => {
    setLanguage(button.dataset.language);
  }));

  copyButton?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.command);
      copyButton.textContent = document.body.classList.contains('english') ? 'Copied' : '已复制';
      window.setTimeout(() => { copyButton.textContent = document.body.classList.contains('english') ? 'Copy' : '复制'; }, 1600);
    } catch {
      copyButton.textContent = document.body.classList.contains('english') ? 'Copy manually' : '请手动复制';
    }
  });
})();
