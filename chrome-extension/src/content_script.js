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

  // ----------------------------------------------------
  // LinkedIn Easy Apply Automation Engine (StrapyATS)
  // ----------------------------------------------------
  function showWidget(message, type = 'info') {
    let widget = document.getElementById('strapyats-autoapply-banner');
    if (!widget) {
      widget = document.createElement('div');
      widget.id = 'strapyats-autoapply-banner';
      widget.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999999;
        background: #090d16;
        border: 2px solid #0085f4;
        color: #fff;
        padding: 14px 18px;
        border-radius: 4px;
        box-shadow: 4px 4px 0px #000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      `;
      document.body.appendChild(widget);
    }
    widget.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-weight: 900; color: #00d2ff; font-family: monospace; font-size: 11px; text-transform: uppercase;">
          ⚡ StrapyATS Autofill
        </span>
        <button id="strapyats-close-widget" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px;">✕</button>
      </div>
      <div style="color: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#e2e8f0'}; font-weight: 600; line-height: 1.4;">
        ${message}
      </div>
    `;
    document.getElementById('strapyats-close-widget')?.addEventListener('click', () => widget.remove());
  }

  function runLinkedInAutoApply() {
    if (!window.location.hostname.includes('linkedin.com')) return;

    chrome.storage.local.get(['strapyats_auto_apply'], (res) => {
      const applyData = res.strapyats_auto_apply;
      if (!applyData || applyData.status !== 'pending') return;

      showWidget('⚡ Iniciando postulación con tu CV Optimizado...');

      // Step 1: Click Easy Apply button if modal not yet open
      const clickApplyButton = () => {
        const modal = document.querySelector('.jobs-easy-apply-modal, div[data-easy-apply-modal], .artdeco-modal');
        if (modal) return;

        const applyBtn = document.querySelector(
          'button.jobs-apply-button, button[aria-label*="Solicitud sencilla"], button[aria-label*="Easy Apply"], button.jobs-apply-button--top-card'
        );
        if (applyBtn) {
          showWidget('Abriendo formulario de Solicitud Sencilla...');
          applyBtn.click();
        }
      };

      clickApplyButton();

      // Step 2 & 3: Watch modal progress (Phone fill + CV upload)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (attempts > 60) {
          clearInterval(interval);
          return;
        }

        const modal = document.querySelector('.jobs-easy-apply-modal, div[data-easy-apply-modal], .artdeco-modal');
        if (!modal) {
          clickApplyButton();
          return;
        }

        // 1. Phone number fill (Step 1)
        const phoneInput = modal.querySelector('input[id*="phoneNumber"], input[id*="phone-number"], input[name*="phoneNumber"], input[type="tel"]');
        if (phoneInput && (!phoneInput.value || phoneInput.value.trim().length < 4)) {
          if (applyData.candidate && applyData.candidate.phone) {
            phoneInput.value = applyData.candidate.phone;
            phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
            phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }

        // 2. File input check (Step 2: Currículum)
        const fileInput = modal.querySelector('input[type="file"][id*="jobs-document-upload"], input[type="file"][name*="file"], input[type="file"]');
        if (fileInput && !fileInput.dataset.strapyatsInjected) {
          fileInput.dataset.strapyatsInjected = 'true';
          showWidget('Inyectando CV adaptado en LinkedIn...');

          try {
            const byteCharacters = atob(applyData.pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const fileName = applyData.fileName || 'CV_Optimizado_ATS.pdf';
            const file = new File([blob], fileName, { type: 'application/pdf', lastModified: Date.now() });

            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.dispatchEvent(new Event('input', { bubbles: true }));
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));

            showWidget(`✅ CV Optimizado cargado con éxito (${fileName}). Responde las preguntas finales de la empresa.`, 'success');

            chrome.storage.local.set({
              strapyats_auto_apply: { ...applyData, status: 'completed' }
            });

            clearInterval(interval);
          } catch (err) {
            console.error('Error al inyectar CV en LinkedIn:', err);
            showWidget('No se pudo adjuntar el PDF automáticamente. Puedes seleccionarlo manualmente con "Cargar currículum".', 'error');
            clearInterval(interval);
          }
          return;
        }

        // 3. Next step button click if we are on step 1 without file input
        if (!fileInput) {
          const nextBtn = modal.querySelector('button.artdeco-button--primary, button[aria-label*="siguiente"], button[aria-label*="Next"]');
          if (nextBtn && nextBtn.innerText && nextBtn.innerText.match(/siguiente|next/i)) {
            showWidget('Avanzando al paso de currículum...');
            nextBtn.click();
          }
        }
      }, 500);
    });
  }

  // Check on load
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runLinkedInAutoApply();
  } else {
    document.addEventListener('DOMContentLoaded', runLinkedInAutoApply);
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
    } else if (request.action === 'TRIGGER_AUTO_APPLY') {
      runLinkedInAutoApply();
      sendResponse({ success: true });
    }
    return true;
  });
})();
