/**
 * Client-Side PDF Generation Helper (Zero Server Memory Footprint)
 * StrapyATS generates ATS-optimized resume PDFs directly in the browser.
 */

export function printResumeDocument(): void {
  if (typeof window === 'undefined') return;
  
  // Add print mode flag to document body
  document.body.classList.add('printing-resume');
  
  setTimeout(() => {
    window.print();
    // Clean up after print dialog opens
    setTimeout(() => {
      document.body.classList.remove('printing-resume');
    }, 500);
  }, 150);
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve(true);
    } catch {
      document.body.removeChild(textarea);
      return Promise.resolve(false);
    }
  }

  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}
