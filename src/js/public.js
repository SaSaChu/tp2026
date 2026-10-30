(() => {
  'use strict';
  const form = document.querySelector('#login-form');
  if (!form) return;
  const password = document.querySelector('#password');
  const toggle = document.querySelector('.password-toggle');
  const message = document.querySelector('#form-message');
  const showMessage = text => { message.textContent = text; message.hidden = false; };
  toggle.addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(visible));
    toggle.setAttribute('aria-label', visible ? '隱藏密碼' : '顯示密碼');
    toggle.querySelector('i').className = visible ? 'bi bi-eye-fill' : 'bi bi-eye-slash-fill';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    let firstInvalid;
    form.querySelectorAll('input').forEach(input => {
      const invalid = input === password ? !input.value : !input.value.trim();
      input.classList.toggle('is-invalid', invalid);
      input.setAttribute('aria-invalid', String(invalid));
      if (invalid && !firstInvalid) firstInvalid = input;
    });
    message.hidden = true;
    if (firstInvalid) { firstInvalid.focus(); return; }
    window.location.href = form.getAttribute('action');
  });
  form.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    message.hidden = true;
  }));
  document.querySelector('.exit-button').addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('input').forEach(input => {
      input.classList.remove('is-invalid'); input.removeAttribute('aria-invalid');
    });
    password.type = 'password';
    toggle.setAttribute('aria-pressed', 'false');
    toggle.setAttribute('aria-label', '顯示密碼');
    toggle.querySelector('i').className = 'bi bi-eye-slash-fill';
    showMessage('已清除登入資料。');
    document.querySelector('#account').focus();
  });
  document.querySelector('#user-agent').textContent = navigator.userAgent;
  const updateTime = () => {
    const now = new Date();
    const time = document.querySelector('#system-time');
    time.dateTime = now.toISOString();
    time.textContent = now.toLocaleTimeString('zh-TW', { timeZone: 'Asia/Taipei', hour12: true });
  };
  updateTime();
  setInterval(updateTime, 1000);
})();
