/**
 * Book Preview Reader & Email Request Handler
 * Book: "From Code to Innovation"
 * Restricts preview to the first 10 pages and provides full-access email requesting functionality.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Configure PDF.js worker
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    const candidatePdfUrls = [
        'From_Code_to_Innovation_Enhanced_Illustrated_Complete_Book (5).pdf',
        'From_Code_to_Innovation_Enhanced_Illustrated_Complete_Book%20(5).pdf',
        'pdf/From_Code_to_Innovation.pdf',
        'books/From_Code_to_Innovation.pdf',
        'From_Code_to_Innovation.pdf'
    ];
    const MAX_PREVIEW_PAGES = 10;

    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.2;

    const canvas = document.getElementById('pdf-render');
    const ctx = canvas ? canvas.getContext('2d') : null;
    
    // UI Elements
    const pdfReaderModal = document.getElementById('pdfReaderModal');
    const requestBookModal = document.getElementById('requestBookModal');
    const lockOverlay = document.getElementById('pdfLockOverlay');
    
    const pageNumEl = document.getElementById('page-num');
    const pageCountEl = document.getElementById('page-count');
    const btnPrev = document.getElementById('prev-page');
    const btnNext = document.getElementById('next-page');
    const btnZoomIn = document.getElementById('zoom-in');
    const btnZoomOut = document.getElementById('zoom-out');
    const zoomLevelEl = document.getElementById('zoom-level');
    const pdfLoadingSpinner = document.getElementById('pdf-loading-spinner');

    /**
     * Render specified page of PDF
     */
    function renderPage(num) {
        if (!pdfDoc || !ctx) return;
        pageRendering = true;

        if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'flex';

        // Check preview restriction
        if (num > MAX_PREVIEW_PAGES) {
            showLockOverlay();
            if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'none';
            pageRendering = false;
            return;
        } else {
            hideLockOverlay();
        }

        pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: scale });
            const outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const transform = outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : null;

            const renderContext = {
                canvasContext: ctx,
                transform: transform,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                pageRendering = false;
                if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'none';

                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            }).catch(err => {
                console.error("Page render error:", err);
                pageRendering = false;
                if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'none';
            });
        }).catch(err => {
            console.error("Get page error:", err);
            pageRendering = false;
            if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'none';
        });

        // Update pagination numbers & button states
        if (pageNumEl) pageNumEl.textContent = num;
        if (pageCountEl) pageCountEl.textContent = MAX_PREVIEW_PAGES;

        if (btnPrev) btnPrev.disabled = (num <= 1);
        if (btnNext) {
            if (num >= MAX_PREVIEW_PAGES) {
                btnNext.classList.add('lock-glow');
            } else {
                btnNext.classList.remove('lock-glow');
            }
        }
        if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + '%';
    }

    /**
     * Queue rendering page if currently rendering another
     */
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }

    /**
     * Navigation & Zoom Handlers
     */
    function onPrevPage() {
        if (pageNum <= 1) return;
        pageNum--;
        queueRenderPage(pageNum);
    }

    function onNextPage() {
        if (pageNum >= MAX_PREVIEW_PAGES) {
            showLockOverlay();
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }

    function onZoomIn() {
        if (scale >= 2.2) return;
        scale += 0.2;
        queueRenderPage(pageNum);
    }

    function onZoomOut() {
        if (scale <= 0.6) return;
        scale -= 0.2;
        queueRenderPage(pageNum);
    }

    function showLockOverlay() {
        if (lockOverlay) lockOverlay.style.display = 'flex';
    }

    function hideLockOverlay() {
        if (lockOverlay) lockOverlay.style.display = 'none';
    }

    /**
     * Load PDF document with candidate fallback
     */
    function loadPdfDocument(index = 0) {
        if (pdfDoc) return;

        if (index >= candidatePdfUrls.length) {
            console.error("All PDF path candidates failed to load.");
            if (pdfLoadingSpinner) {
                pdfLoadingSpinner.innerHTML = `
                    <div style="color: #ff6b6b; text-align: center; padding: 25px; max-width: 440px;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" style="margin-bottom: 12px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        <h4 style="color: #fff; font-size: 18px; margin-bottom: 8px;">Unable to load book preview PDF</h4>
                        <p style="margin: 0 0 15px 0; font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.5;">If opening from a local file explorer, please serve via local web server (e.g., Live Server or http-server) or click below to request the full copy via email.</p>
                        <button onclick="openRequestModal()" class="btn btn-primary py-2 px-4 style-btn-sm" style="font-weight: 600;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-1" style="vertical-align: text-bottom;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> Request Full Access via Email
                        </button>
                    </div>
                `;
            }
            return;
        }

        if (pdfLoadingSpinner) pdfLoadingSpinner.style.display = 'flex';

        const currentUrl = candidatePdfUrls[index];
        const loadingTask = pdfjsLib.getDocument({
            url: currentUrl,
            disableRange: true,
            disableStream: true,
            disableAutoFetch: true
        });

        loadingTask.promise.then(pdfDoc_ => {
            pdfDoc = pdfDoc_;
            pageNum = 1;
            renderPage(pageNum);
        }).catch(err => {
            console.warn(`Failed loading PDF from '${currentUrl}', trying next path...`, err);
            loadPdfDocument(index + 1);
        });
    }

    /**
     * Modal Event Binding
     */
    window.openPdfReader = function() {
        if (pdfReaderModal) {
            pdfReaderModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            if (!pdfDoc) {
                loadPdfDocument();
            }
        }
    };

    window.closePdfReader = function() {
        if (pdfReaderModal) {
            pdfReaderModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    window.openRequestModal = function() {
        // If opened from PDF reader, hide PDF reader first or overlay over it
        if (requestBookModal) {
            requestBookModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeRequestModal = function() {
        if (requestBookModal) {
            requestBookModal.style.display = 'none';
            if (!pdfReaderModal || pdfReaderModal.style.display !== 'flex') {
                document.body.style.overflow = 'auto';
            }
        }
    };

    // Bind Controls
    if (btnPrev) btnPrev.addEventListener('click', onPrevPage);
    if (btnNext) btnNext.addEventListener('click', onNextPage);
    if (btnZoomIn) btnZoomIn.addEventListener('click', onZoomIn);
    if (btnZoomOut) btnZoomOut.addEventListener('click', onZoomOut);

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (pdfReaderModal && pdfReaderModal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') onPrevPage();
            if (e.key === 'ArrowRight') onNextPage();
            if (e.key === 'Escape') closePdfReader();
        }
        if (requestBookModal && requestBookModal.style.display === 'flex') {
            if (e.key === 'Escape') closeRequestModal();
        }
    });

    // Email Request Form Handler
    const requestForm = document.getElementById('bookRequestForm');
    const requestStatusMsg = document.getElementById('requestStatusMsg');

    if (requestForm) {
        requestForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('req-name');
            const emailInput = document.getElementById('req-email');
            const messageInput = document.getElementById('req-message');

            const name = nameInput ? nameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const message = messageInput ? messageInput.value.trim() : '';

            if (!name || !email) {
                if (requestStatusMsg) {
                    requestStatusMsg.innerHTML = `<span style="color: #ff6b6b;"><i class="ion-ios-alert mr-1"></i> Please fill in your name and email.</span>`;
                }
                return;
            }

            const recipient = 'prakash7418r@gmail.com';
            const subject = encodeURIComponent(`Full Book Access Request: From Code to Innovation (${name})`);
            const bodyContent = `Hello Prakash,

I am requesting full access to your book "From Code to Innovation".

Requester Details:
- Name: ${name}
- Email: ${email}

${message ? `Note/Message:\n${message}\n\n` : ''}Thank you!`;

            const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;

            if (requestStatusMsg) {
                requestStatusMsg.innerHTML = `
                    <div style="background: rgba(255, 189, 57, 0.15); border: 1px solid #ffbd39; color: #ffbd39; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 15px; text-align: left;">
                        <i class="ion-ios-checkmark-circle mr-1" style="font-size: 18px; vertical-align: middle;"></i>
                        <strong>Request Prepared!</strong> Opening your default email app to send to <code>prakash7418r@gmail.com</code>.
                    </div>
                `;
            }

            setTimeout(() => {
                window.location.href = mailtoUrl;
            }, 800);
        });
    }
});
