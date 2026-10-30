(() => {
  'use strict';
  const form = document.querySelector('#work-filters');
  if (!form) return;
  const rows = Array.from(document.querySelectorAll('#work-rows tr'));
  const feedback = document.querySelector('#work-feedback');
  const selectAll = document.querySelector('#select-all');
  const confirmDownload = document.querySelector('#confirm-download');
  const downloadFeedback = document.querySelector('#download-feedback');
  const visibleChecks = () => rows.filter(row => !row.hidden).map(row => row.querySelector('[name="case"]')).filter(Boolean);
  const updateSelection = () => {
    if (!selectAll) return;
    const checks = visibleChecks();
    const selected = checks.filter(check => check.checked);
    const allSelected = checks.length > 0 && selected.length === checks.length;
    selectAll.textContent = allSelected ? '取消全選' : '全選';
    selectAll.setAttribute('aria-pressed', String(allSelected));
    selectAll.disabled = !checks.length;
    document.querySelector('.download-actions').classList.toggle('has-selection', selected.length > 0);
    downloadFeedback.hidden = true;
  };
  const filterRows = () => {
    closeCaseMenu();
    const query = form.elements.search.value.trim().toLowerCase();
    const date = form.elements.date.value;
    const status = form.elements.status ? form.elements.status.value : 'all';
    let count = 0;
    rows.forEach(row => {
      const numbers = `${row.cells[1].textContent} ${row.cells[2].textContent}`.toLowerCase();
      row.hidden = !numbers.includes(query) || (date && row.dataset.date !== date) || (status !== 'all' && row.dataset.status !== status);
      if (!row.hidden) count += 1;
    });
    document.querySelector('#empty-result').hidden = count > 0;
    feedback.textContent = `共 ${count} 筆案件`;
    updateSelection();
  };
  const caseMenu = document.querySelector('#case-menu');
  let activeRow;
  let reportRow;
  const reportModal = document.querySelector('#report-type-modal');
  const reportForm = document.querySelector('#report-type-form');
  if (reportModal) {
    reportForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!reportRow) return;
      const value = reportForm.querySelector('[name="report-type"]:checked').value;
      reportRow.cells[7].textContent = value;
      feedback.textContent = `已將案件 ${reportRow.cells[1].textContent} 的回報性質更新為${value}`;
      bootstrap.Modal.getInstance(reportModal).hide();
    });
    reportModal.addEventListener('hidden.bs.modal', () => {
      reportRow?.focus();
      reportRow = null;
    });
  }
  const closeCaseMenu = (restoreFocus = false) => {
    if (!caseMenu || !activeRow) return;
    caseMenu.classList.remove('show');
    activeRow.classList.remove('is-selected');
    activeRow.setAttribute('aria-expanded', 'false');
    if (restoreFocus) activeRow.focus();
    activeRow = null;
  };
  const openCaseMenu = (row, keyboard = false) => {
    const sameRow = activeRow === row;
    closeCaseMenu();
    if (sameRow) return;
    activeRow = row;
    row.classList.add('is-selected');
    row.setAttribute('aria-expanded', 'true');
    caseMenu.classList.add('show');
    const rect = row.getBoundingClientRect();
    const cell = row.cells[1].getBoundingClientRect();
    const left = Math.max(8, Math.min(cell.left, window.innerWidth - caseMenu.offsetWidth - 8));
    let top = rect.bottom - 14;
    if (top + caseMenu.offsetHeight > window.innerHeight - 8) top = rect.top - caseMenu.offsetHeight;
    caseMenu.style.left = `${left}px`;
    caseMenu.style.top = `${Math.max(8, top)}px`;
    if (keyboard) caseMenu.querySelector('a').focus();
  };
  if (caseMenu) {
    rows.forEach(row => {
      row.addEventListener('click', () => openCaseMenu(row));
      row.addEventListener('keydown', event => {
        if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
          event.preventDefault();
          openCaseMenu(row, true);
        }
      });
    });
    document.addEventListener('click', event => {
      if (!caseMenu.contains(event.target) && !activeRow?.contains(event.target)) closeCaseMenu();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeCaseMenu(true);
    });
    caseMenu.addEventListener('keydown', event => {
      const items = Array.from(caseMenu.querySelectorAll('a'));
      const index = items.indexOf(document.activeElement);
      if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
      }
      if (event.key === 'Tab') closeCaseMenu();
    });
    caseMenu.addEventListener('click', event => {
      const action = event.target.closest('[data-case-action="report-type"]');
      if (action && activeRow) {
        event.preventDefault();
        reportRow = activeRow;
        const value = reportRow.cells[7].textContent.trim();
        reportForm.querySelectorAll('[name="report-type"]').forEach(input => {
          input.checked = input.value === value;
        });
        closeCaseMenu();
        bootstrap.Modal.getOrCreateInstance(reportModal).show();
        return;
      }
      closeCaseMenu(true);
    });
    document.querySelector('.table-responsive').addEventListener('scroll', () => closeCaseMenu());
    window.addEventListener('resize', () => closeCaseMenu());
    window.addEventListener('scroll', () => closeCaseMenu());
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    filterRows();
  });
  form.addEventListener('input', filterRows);
  form.addEventListener('change', filterRows);

  if (selectAll) {
    selectAll.addEventListener('click', () => {
      const checks = visibleChecks();
      const checked = !checks.every(check => check.checked);
      checks.forEach(check => { check.checked = checked; });
      updateSelection();
    });
    rows.forEach(row => row.addEventListener('change', updateSelection));
    confirmDownload.addEventListener('click', () => {
      const selected = visibleChecks().filter(check => check.checked);
      downloadFeedback.textContent = selected.length
        ? `已選取 ${selected.length} 筆案件，下載服務尚未串接。`
        : '請先勾選要下載的案件。';
      downloadFeedback.hidden = false;
    });
  }
})();
