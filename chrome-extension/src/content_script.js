// content_script.js — StrapyATS Chrome Extension
// Extracts job details from LinkedIn, GetOnBoard, Indeed, and other platforms.
// Powered by CierraLab (@realstrapy)

(function () {
  function getCleanText(el) {
    if (!el) return '';
    return el.innerText.trim().replace(/\n{3,}/g, '\n\n');
  }

  function extractLinkedInJob() {
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title, h1.t-24');
    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .jobs-unified-top-card__subtitle-primary-grouping a');
    const locationEl = document.querySelector('.job-details-jobs-unified-top-card__bullet, .jobs-unified-top-card__bullet, .jobs-unified-top-card__workplace-type');
    const descEl = document.querySelector('#job-details, .jobs-description__content, .jobs-box__html-content, .jobs-description-content__text');

    if (descEl) {
      const title = getCleanText(titleEl) || 'Puesto en LinkedIn';
      const company = getCleanText(companyEl) || 'Empresa';
      const location = getCleanText(locationEl) || '';
      const body = getCleanText(descEl);

      const fullText = `Puesto: ${title}\nEmpresa: ${company}${location ? `\nUbicación: ${location}` : ''}\n\nDescripción del Puesto:\n${body}`;
      return {
        title,
        company,
        location,
        fullText,
        source: 'LinkedIn'
      };
    }
    return null;
  }

  function extractGetOnBoardJob() {
    const titleEl = document.querySelector('h1.job-title, .job-header h1, h1[itemprop="title"]');
    const companyEl = document.querySelector('.job-company-name, .company-header h2, [itemprop="hiringOrganization"]');
    const descEl = document.querySelector('[data-qa="job-body"], .job-description, .js-theme-body, #job-body');

    if (descEl) {
      const title = getCleanText(titleEl) || 'Puesto en GetOnBoard';
      const company = getCleanText(companyEl) || 'Empresa';
      const body = getCleanText(descEl);

      const fullText = `Puesto: ${title}\nEmpresa: ${company}\n\nDescripción del Puesto:\n${body}`;
      return {
        title,
        company,
        location: 'Remoto / Latam',
        fullText,
        source: 'GetOnBoard'
      };
    }
    return null;
  }

  function extractIndeedJob() {
    const titleEl = document.querySelector('.jobsearch-JobInfoHeader-title, h1.jobsearch-JobInfoHeader-title');
    const companyEl = document.querySelector('[data-company-name="true"], .jobsearch-InlineCompanyRating-companyHeader');
    const descEl = document.querySelector('#jobDescriptionText, .jobsearch-jobDescriptionText');

    if (descEl) {
      const title = getCleanText(titleEl) || 'Puesto en Indeed';
      const company = getCleanText(companyEl) || 'Empresa';
      const body = getCleanText(descEl);

      const fullText = `Puesto: ${title}\nEmpresa: ${company}\n\nDescripción del Puesto:\n${body}`;
      return {
        title,
        company,
        location: '',
        fullText,
        source: 'Indeed'
      };
    }
    return null;
  }

  function extractGenericJob() {
    // Look for common main semantic containers
    const candidates = [
      document.querySelector('article'),
      document.querySelector('main'),
      document.querySelector('[role="main"]'),
      document.querySelector('.job-description'),
      document.querySelector('#job-description'),
      document.querySelector('.description')
    ];

    for (const el of candidates) {
      if (el && el.innerText && el.innerText.trim().length > 150) {
        const title = document.querySelector('h1')?.innerText.trim() || document.title || 'Oferta de Empleo';
        const body = getCleanText(el);
        return {
          title,
          company: 'Empresa',
          location: '',
          fullText: `Puesto: ${title}\n\nDescripción:\n${body}`,
          source: 'Página Web'
        };
      }
    }

    // Fallback: Selected text on page
    const selection = window.getSelection() ? window.getSelection().toString().trim() : '';
    if (selection && selection.length > 50) {
      return {
        title: 'Texto Seleccionado',
        company: 'Empresa',
        location: '',
        fullText: selection,
        source: 'Selección'
      };
    }

    return null;
  }

  function extractJobDetails() {
    const hostname = window.location.hostname;
    if (hostname.includes('linkedin.com')) {
      const li = extractLinkedInJob();
      if (li) return li;
    }
    if (hostname.includes('getonbrd.com')) {
      const gob = extractGetOnBoardJob();
      if (gob) return gob;
    }
    if (hostname.includes('indeed.com')) {
      const ind = extractIndeedJob();
      if (ind) return ind;
    }
    return extractGenericJob();
  }

  // Listener for messages from popup or background service worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'EXTRACT_JOB' || request.action === 'GET_JOB_TEXT') {
      const data = extractJobDetails();
      if (data) {
        sendResponse({
          success: true,
          data: data,
          url: window.location.href
        });
      } else {
        sendResponse({
          success: false,
          error: 'No se detectó una descripción de empleo estructurada en esta página. Puedes seleccionar el texto manualmente y abrir StrapyATS.'
        });
      }
    }
    return true;
  });
})();
