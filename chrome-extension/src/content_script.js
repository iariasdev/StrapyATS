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
        border-radius: 6px;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.8), 0 0 15px rgba(0, 133, 244, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        max-width: 420px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      document.body.appendChild(widget);
    }
    widget.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-weight: 900; color: #00d2ff; font-family: monospace; font-size: 11px; text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
          ⚡ StrapyATS Autofill
        </span>
        <button id="strapyats-close-widget" style="background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 14px; padding: 0 4px;">✕</button>
      </div>
      <div style="color: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#e2e8f0'}; font-weight: 500; line-height: 1.45;">
        ${message}
      </div>
    `;
    document.getElementById('strapyats-close-widget')?.addEventListener('click', () => widget.remove());
  }

  function formatPhoneForLinkedIn(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    // Si incluye código de país chileno 56 y tiene 10 u 11 dígitos (ej: 56993953191)
    if (digits.startsWith('56') && digits.length >= 10) {
      return digits.slice(2);
    }
    // Si ya son 8 a 10 dígitos (ej: 993953191)
    if (digits.length >= 8 && digits.length <= 10) {
      return digits;
    }
    return phone.replace(/[^\d+]/g, '').trim() || digits;
  }

  function setNativeInputValue(input, value) {
    if (!input || !value) return;
    input.focus();
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(input, value);
    } else {
      input.value = value;
    }
    input.dispatchEvent(new Event('input', { bubbles: true, cancelable: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, cancelable: true, composed: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '0' }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: '0' }));
    input.dispatchEvent(new Event('blur', { bubbles: true, composed: true }));
  }

  function findPhoneInputInModal(modal) {
    const scope = modal || document;

    // 1. Direct inputs by type or attributes (Priority 1)
    const inputs = Array.from(scope.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"])'));
    for (const inp of inputs) {
      const type = (inp.getAttribute('type') || '').toLowerCase();
      const id = (inp.id || '').toLowerCase();
      const name = (inp.name || '').toLowerCase();
      const aria = (inp.getAttribute('aria-label') || '').toLowerCase();
      const auto = (inp.getAttribute('autocomplete') || '').toLowerCase();

      if (
        type === 'tel' ||
        id.includes('phone') || id.includes('mobile') || id.includes('celular') || id.includes('tel') ||
        name.includes('phone') || name.includes('mobile') || name.includes('celular') || name.includes('tel') ||
        aria.includes('phone') || aria.includes('teléfono') || aria.includes('telefono') || aria.includes('móvil') || aria.includes('movil') ||
        auto.includes('tel')
      ) {
        return inp;
      }
    }

    // 2. Search by nearby label or span text (Priority 2)
    const allLabels = Array.from(scope.querySelectorAll('label, .artdeco-text-input--label, span, div'));
    for (const lbl of allLabels) {
      const txt = (lbl.innerText || lbl.textContent || '').toLowerCase().trim();
      if (
        txt.includes('teléfono') || 
        txt.includes('telefono') || 
        txt.includes('móvil') || 
        txt.includes('movil') || 
        txt.includes('celular') || 
        txt.includes('phone') || 
        txt.includes('mobile')
      ) {
        const forId = lbl.getAttribute('for');
        if (forId) {
          const inp = document.getElementById(forId);
          if (inp && inp.tagName === 'INPUT') return inp;
        }
        const container = lbl.closest('.fb-single-line-text, .artdeco-text-input, .jobs-easy-apply-form-element, div') || lbl.parentElement;
        if (container) {
          const inp = container.querySelector('input:not([type="hidden"])');
          if (inp) return inp;
        }
      }
    }

    // 3. Fallback: First text input on contact step that is NOT email or search (Priority 3)
    for (const inp of inputs) {
      const type = (inp.getAttribute('type') || 'text').toLowerCase();
      const val = (inp.value || '').toLowerCase();
      const id = (inp.id || '').toLowerCase();
      const name = (inp.name || '').toLowerCase();
      const aria = (inp.getAttribute('aria-label') || '').toLowerCase();

      if (type !== 'email' && !val.includes('@') && !id.includes('email') && !name.includes('email') && !aria.includes('email') && !id.includes('search') && !name.includes('search')) {
        return inp;
      }
    }

    return null;
  }

  function findNextButtonInModal(modal) {
    const scope = modal || document;
    const buttons = Array.from(scope.querySelectorAll('button, [role="button"]'));
    for (const btn of buttons) {
      const text = (btn.innerText || btn.textContent || '').toLowerCase().trim();
      const aria = (btn.getAttribute('aria-label') || '').toLowerCase();
      if (
        text === 'siguiente' || 
        text === 'next' || 
        text === 'continuar' || 
        text === 'revisar' || 
        text === 'review' ||
        text.includes('siguiente') || 
        text.includes('next') || 
        text.includes('continuar') || 
        text.includes('revisar') || 
        text.includes('review') ||
        aria.includes('siguiente') || 
        aria.includes('next') || 
        aria.includes('continuar') ||
        btn.hasAttribute('data-easy-apply-next-button')
      ) {
        return btn;
      }
    }
    return scope.querySelector('footer button.artdeco-button--primary, button.artdeco-button--primary');
  }

  function runLinkedInAutoApply() {
    if (!window.location.hostname.includes('linkedin.com')) return;

    chrome.storage.local.get(['strapyats_auto_apply'], (res) => {
      const applyData = res.strapyats_auto_apply;
      if (!applyData || applyData.status !== 'pending') return;

      showWidget('⚡ Iniciando postulación con tu CV Optimizado...');

      const clickApplyButton = () => {
        const modal = document.querySelector('.jobs-easy-apply-modal, div[data-easy-apply-modal], .artdeco-modal');
        if (modal) return true;

        const applyBtn = document.querySelector(
          'button.jobs-apply-button, button[aria-label*="Solicitud sencilla" i], button[aria-label*="Easy Apply" i], button.jobs-apply-button--top-card, button[data-job-id]'
        );
        if (applyBtn) {
          showWidget('Abriendo formulario de Solicitud Sencilla en LinkedIn...');
          applyBtn.click();
          return true;
        }
        return false;
      };

      clickApplyButton();

      let attempts = 0;
      let hasInjectedCV = false;
      let hasFilledPhone = false;

      const interval = setInterval(() => {
        attempts++;
        if (attempts > 80) {
          clearInterval(interval);
          return;
        }

        const modal = document.querySelector('.jobs-easy-apply-modal, div[data-easy-apply-modal], .artdeco-modal');
        if (!modal) {
          clickApplyButton();
          return;
        }

        const modalText = (modal.innerText || '').toLowerCase();
        const isContactStep = modalText.includes('contacto') || modalText.includes('contact');
        const isResumeStep = modalText.includes('currículum') || modalText.includes('curriculum') || modalText.includes('resume') || modalText.includes('cv');

        // --- STEP 1: Contact Information (Phone Fill & Next Step) ---
        if (isContactStep && !hasFilledPhone) {
          const phoneInput = findPhoneInputInModal(modal);
          const candidatePhone = applyData.candidate?.phone || '';

          if (phoneInput) {
            const currentVal = (phoneInput.value || '').trim();
            const formattedPhone = formatPhoneForLinkedIn(candidatePhone);

            if (formattedPhone && formattedPhone.length >= 5 && (!currentVal || currentVal.length < 5)) {
              setNativeInputValue(phoneInput, formattedPhone);
              hasFilledPhone = true;
              showWidget(`📞 Teléfono completado (<strong>${formattedPhone}</strong>). Avanzando...`);
              
              setTimeout(() => {
                const nextBtn = findNextButtonInModal(modal);
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
              }, 450);
            } else if (currentVal && currentVal.length >= 5) {
              hasFilledPhone = true;
              showWidget(`📞 Teléfono verificado. Avanzando al paso de CV...`);
              setTimeout(() => {
                const nextBtn = findNextButtonInModal(modal);
                if (nextBtn && !nextBtn.disabled) nextBtn.click();
              }, 450);
            } else {
              showWidget('👉 Ingresa tu número de teléfono y haz clic en <strong>"Siguiente"</strong>. StrapyATS adjuntará automáticamente tu CV.', 'info');
            }
          } else {
            showWidget('👉 Haz clic en <strong>"Siguiente"</strong> para continuar al paso del CV.', 'info');
          }
        }

        // --- STEP 2: Resume Upload ---
        const fileInput = modal.querySelector('input[type="file"]');
        if (fileInput && !hasInjectedCV) {
          // If modal shows "Cargar currículum" button (because of existing CVs), trigger it
          const uploadLabel = modal.querySelector('label[for*="jobs-document-upload"], .jobs-document-upload__upload-button, button[aria-label*="Cargar currículum" i]');
          if (uploadLabel && !fileInput.dataset.strapyatsInjected) {
            try { uploadLabel.click(); } catch (_) {}
          }

          if (!fileInput.dataset.strapyatsInjected) {
            fileInput.dataset.strapyatsInjected = 'true';
            hasInjectedCV = true;

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

              showWidget(`✅ ¡CV Optimizado cargado con éxito! (<strong>${fileName}</strong>)<br/><span style="color:#94a3b8; font-size:11px;">Revisa las preguntas adicionales y confirma tu postulación.</span>`, 'success');

              chrome.storage.local.set({
                strapyats_auto_apply: { ...applyData, status: 'completed' }
              });

              clearInterval(interval);
            } catch (err) {
              console.error('Error al inyectar CV en LinkedIn:', err);
              showWidget('⚠️ No se pudo inyectar el archivo automáticamente. Selecciona el archivo descargado usando "Cargar currículum".', 'error');
              clearInterval(interval);
            }
          }
        }
      }, 450);
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

