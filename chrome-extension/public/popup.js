// popup.js — StrapyATS Chrome Extension Popup Controller
// Powered by CierraLab (@realstrapy)

document.addEventListener('DOMContentLoaded', async () => {
  const platformBadge = document.getElementById('platformBadge');
  const jobTitle = document.getElementById('jobTitle');
  const jobCompany = document.getElementById('jobCompany');
  const jobPreview = document.getElementById('jobPreview');
  const btnOptimize = document.getElementById('btnOptimize');
  const btnCopy = document.getElementById('btnCopy');
  const toggleSettings = document.getElementById('toggleSettings');
  const settingsPanel = document.getElementById('settingsPanel');
  const appUrlInput = document.getElementById('appUrlInput');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const statusAlert = document.getElementById('statusAlert');

  let extractedData = null;
  const DEFAULT_APP_URL = 'http://localhost:3000';

  // Load configured App URL
  chrome.storage.local.get(['strapyats_app_url'], (res) => {
    if (res.strapyats_app_url) {
      appUrlInput.value = res.strapyats_app_url;
    } else {
      appUrlInput.value = DEFAULT_APP_URL;
    }
  });

  // Query Active Tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.id) {
    platformBadge.textContent = 'Sin pestaña';
    jobTitle.textContent = 'No se pudo acceder a la pestaña activa.';
    return;
  }

  // Try extracting job info from page
  function requestExtraction() {
    chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB' }, (response) => {
      if (chrome.runtime.lastError || !response || !response.success) {
        // Fallback: Try injecting content script manually if not yet active
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            files: ['src/content_script.js']
          },
          () => {
            if (chrome.runtime.lastError) {
              platformBadge.className = 'badge badge-warning';
              platformBadge.textContent = 'No soportado';
              jobTitle.textContent = 'No se puede extraer en esta página';
              jobPreview.textContent = 'Navega a una oferta en LinkedIn, GetOnBoard o Indeed, o copia el texto manualmente.';
              return;
            }

            // Retry after injection
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB' }, (retryRes) => {
                if (retryRes && retryRes.success) {
                  displayExtractedData(retryRes.data);
                } else {
                  platformBadge.className = 'badge badge-warning';
                  platformBadge.textContent = 'No detectado';
                  jobTitle.textContent = 'Sin oferta estructurada';
                  jobPreview.textContent = retryRes ? retryRes.error : 'Selecciona el texto del empleo en la página para optimizarlo.';
                }
              });
            }, 100);
          }
        );
      } else {
        displayExtractedData(response.data);
      }
    });
  }

  function displayExtractedData(data) {
    extractedData = data;
    platformBadge.className = 'badge badge-live';
    platformBadge.textContent = `${data.source || 'Oferta'} Detectada`;
    jobTitle.textContent = data.title || 'Oferta de Empleo';
    jobCompany.textContent = `${data.company || 'Empresa'} ${data.location ? `• ${data.location}` : ''}`;
    jobPreview.textContent = data.fullText || '';
    btnOptimize.disabled = false;
    btnCopy.disabled = false;
  }

  requestExtraction();

  // Button: Optimize with StrapyATS
  btnOptimize.addEventListener('click', () => {
    if (!extractedData) return;

    // Attach active tab URL
    extractedData.url = tab.url;

    chrome.storage.local.get(['strapyats_app_url'], (res) => {
      const appUrl = res.strapyats_app_url || DEFAULT_APP_URL;

      // Store in chrome storage
      chrome.storage.local.set({
        strapyats_extracted_job: {
          title: extractedData.title,
          company: extractedData.company,
          fullText: extractedData.fullText,
          url: tab.url,
          timestamp: Date.now()
        }
      }, () => {
        // Open StrapyATS web dashboard
        chrome.tabs.create({ url: `${appUrl}?fromExtension=1` }, (newTab) => {
          if (newTab && newTab.id) {
            // Wait for tab to load and inject the extracted data into localStorage
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
              if (tabId === newTab.id && info.status === 'complete') {
                chrome.tabs.onUpdated.removeListener(listener);
                chrome.scripting.executeScript({
                  target: { tabId: newTab.id },
                  func: (data) => {
                    try {
                      localStorage.setItem('strapyats_extracted_job', JSON.stringify(data));
                      window.dispatchEvent(new CustomEvent('strapyats_job_imported', { detail: data }));
                    } catch (e) {
                      console.error('Error saving imported job:', e);
                    }
                  },
                  args: [extractedData]
                });
              }
            });
          }
        });
      });
    });
  });

  // Button: Copy
  btnCopy.addEventListener('click', async () => {
    if (!extractedData || !extractedData.fullText) return;
    try {
      await navigator.clipboard.writeText(extractedData.fullText);
      const originalText = btnCopy.innerHTML;
      btnCopy.innerHTML = '<span>✅</span><span>¡Copiado al Portapapeles!</span>';
      setTimeout(() => {
        btnCopy.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  });

  // Settings Toggle
  toggleSettings.addEventListener('click', (e) => {
    e.preventDefault();
    settingsPanel.style.display = settingsPanel.style.display === 'block' ? 'none' : 'block';
  });

  // Save Settings
  btnSaveSettings.addEventListener('click', () => {
    const newUrl = appUrlInput.value.trim() || DEFAULT_APP_URL;
    chrome.storage.local.set({ strapyats_app_url: newUrl }, () => {
      statusAlert.textContent = 'Configuración guardada';
      statusAlert.className = 'status-msg status-success';
      setTimeout(() => {
        statusAlert.style.display = 'none';
        settingsPanel.style.display = 'none';
      }, 1500);
    });
  });
});
