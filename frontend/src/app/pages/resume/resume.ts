import { Component, ElementRef, afterNextRender, computed, effect, signal, viewChild, DestroyRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooter } from '../../layout/site-footer';
import { SiteHeader } from '../../layout/site-header';
import { Arrow } from '../../shared/arrow';

/** One CV per kind of role. Drop each PDF into public/resume/ with the file name shown here. */
const RESUMES = [
  { id: 'software-engineer', label: 'Software Engineer' },
  { id: 'web-developer', label: 'Web Developer' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'artificial-intelligence', label: 'Artificial Intelligence' },
] as const;

type Status = 'idle' | 'checking' | 'ready' | 'missing';

/** /resume: pick a CV from the dropdown, see the PDF right below it, and download it. */
@Component({
  selector: 'app-resume-page',
  imports: [SiteHeader, SiteFooter, RouterLink, Arrow],
  template: `
    <app-site-header />

    <main>
      <section class="page">
        <div class="container">
          <a routerLink="/" class="split-btn split-btn--sm split-btn--back"><app-arrow dir="left" /><span class="split-btn__label">Back to home</span></a>

          <h1>My resume</h1>
          <p class="lead">Select resume from dropdown</p>

          <div class="pick">
            <label for="resume-select">Resume</label>
            <div class="pick__box">
              <select id="resume-select" [value]="selected()" (change)="choose($any($event.target).value)">
                <option value="" disabled>Select resume…</option>
                @for (r of resumes; track r.id) {
                  <option [value]="r.id">{{ r.label }}</option>
                }
              </select>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </div>
          </div>

          <!-- our own document viewer: a header with the file name, zoom and download, and the page(s) drawn below it -->
          <section class="doc" aria-label="Resume preview">
            <header class="doc__bar">
              <span class="doc__file">
                <span class="doc__icon" aria-hidden="true">PDF</span>
                <span class="doc__name">{{ current() ? fileName() : 'No resume selected' }}</span>
                @if (pages() > 0) {
                  <span class="doc__pages">{{ pages() }} {{ pages() === 1 ? 'page' : 'pages' }}</span>
                }
              </span>

              <span class="doc__tools">
                <span class="zoom" role="group" aria-label="Zoom">
                  <button type="button" (click)="zoomBy(-0.15)" [disabled]="status() !== 'ready' || zoom() <= 0.6" aria-label="Zoom out">−</button>
                  <output>{{ (zoom() * 100).toFixed(0) }}%</output>
                  <button type="button" (click)="zoomBy(0.15)" [disabled]="status() !== 'ready' || zoom() >= 2" aria-label="Zoom in">+</button>
                </span>
                @if (status() === 'ready') {
                  <a class="split-btn split-btn--sm" [href]="url()" [attr.download]="fileName()">
                    <span class="split-btn__label">Download PDF</span>
                    <app-arrow dir="down" />
                  </a>
                } @else {
                  <span class="split-btn split-btn--sm split-btn--off" aria-disabled="true">
                    <span class="split-btn__label">Download PDF</span>
                    <app-arrow dir="down" />
                  </span>
                }
              </span>
            </header>

            <div class="doc__body" #body>
              <div class="doc__pages-wrap" #pagesWrap [hidden]="status() !== 'ready'"></div>
              @switch (status()) {
                @case ('checking') { <p class="msg">Loading…</p> }
                @case ('missing') { <p class="msg"><strong>{{ current()?.label }}</strong> resume isn't uploaded yet. Check back soon.</p> }
                @case ('ready') { }
                @default { <p class="msg">Select a resume from the dropdown and it will show here.</p> }
              }
            </div>
          </section>
        </div>
      </section>
    </main>

    <app-site-footer />
  `,
  styles: `
    .page { background: var(--surface); padding-block: calc(clamp(2rem, 5vw, 3.5rem) + var(--nav-space)) clamp(3rem, 7vw, 5rem); min-height: 70vh; }
    .split-btn--back { margin-bottom: 1.5rem; }
    h1 { margin: 0; color: var(--indigo); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; letter-spacing: -0.02em; }
    .lead { margin: 0.5rem 0 1.75rem; color: var(--muted); font-size: 1.1rem; }

    .pick { display: grid; gap: 0.4rem; width: min(100%, 22rem); margin-bottom: 1.25rem; }
    .pick label { color: var(--muted); font: 700 0.78rem var(--font-heading); letter-spacing: 0.12em; text-transform: uppercase; }
    .pick__box { position: relative; color: var(--indigo); }
    .pick__box select {
      width: 100%; appearance: none; padding: 0.85rem 2.8rem 0.85rem 1.2rem; border: 1px solid #d3d0ea; border-radius: 999px;
      background: var(--white); color: var(--indigo); font: 600 1rem var(--font-heading); cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .pick__box select:hover { border-color: var(--coral); }
    .pick__box select:focus-visible { outline: 3px solid var(--coral); outline-offset: 2px; }
    .pick__box svg { position: absolute; right: 1.1rem; top: 50%; margin-top: -9px; pointer-events: none; }

    /* the document box: a white card with its own header, and a soft lavender desk the pages sit on */
    .doc { overflow: hidden; border: 1px solid var(--line); border-radius: 22px; background: var(--white); box-shadow: 0 22px 50px rgba(52, 47, 112, 0.12); }
    .doc__bar {
      display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1.25rem;
      padding: 0.85rem 1.1rem; border-bottom: 1px solid var(--line); background: var(--white);
    }
    .doc__file { display: inline-flex; align-items: center; gap: 0.7rem; min-width: 0; }
    .doc__icon { display: grid; place-items: center; width: 2.3rem; height: 2.3rem; border-radius: 10px; background: var(--coral); color: var(--white); font: 800 0.65rem var(--font-heading); letter-spacing: 0.04em; }
    .doc__name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--indigo); font: 700 0.95rem var(--font-heading); }
    .doc__pages { padding: 0.15rem 0.65rem; border-radius: 999px; background: var(--surface); color: var(--muted); font: 600 0.75rem var(--font-heading); white-space: nowrap; }
    .doc__tools { display: inline-flex; align-items: center; gap: 0.9rem; }
    .zoom { display: inline-flex; align-items: center; gap: 0.15rem; padding: 0.2rem; border-radius: 999px; background: var(--surface); }
    .zoom button {
      width: 2rem; height: 2rem; border: 0; border-radius: 50%; background: none; color: var(--indigo); font: 600 1.2rem/1 var(--font-heading); cursor: pointer;
      transition: background 0.2s;
    }
    .zoom button:hover:not(:disabled) { background: var(--white); }
    .zoom button:disabled { opacity: 0.35; cursor: default; }
    .zoom output { min-width: 3rem; text-align: center; color: var(--indigo); font: 700 0.82rem var(--font-heading); }
    .split-btn--off { cursor: not-allowed; opacity: 0.5; }
    .split-btn--off:hover .split-btn__label { background: #e6e4f2; }
    .split-btn--off:hover app-arrow { --arrow-bg: var(--indigo-deep); --arrow-nudge: 0; }

    .doc__body {
      position: relative; overflow-x: auto; overflow-y: scroll; height: min(90vh, 78rem); min-height: 30rem; padding: clamp(1rem, 3vw, 2rem);
      background:
        radial-gradient(circle at 20% 0%, rgba(248, 107, 73, 0.08), transparent 45%),
        radial-gradient(circle at 90% 100%, rgba(107, 101, 196, 0.12), transparent 50%),
        #ecebf6;
    }
    /* an always-visible scrollbar (macOS hides the default one until you scroll), styled to match the site */
    .doc__body::-webkit-scrollbar { width: 14px; height: 14px; }
    .doc__body::-webkit-scrollbar-track { background: rgba(52, 47, 112, 0.08); }
    .doc__body::-webkit-scrollbar-thumb { background: #a9a5d6; border: 3px solid #ecebf6; border-radius: 999px; }
    .doc__body::-webkit-scrollbar-thumb:hover { background: var(--coral); }
    @supports (-moz-appearance: none) { .doc__body { scrollbar-color: #a9a5d6 rgba(52, 47, 112, 0.08); scrollbar-width: auto; } }
    .doc__pages-wrap { display: grid; justify-content: center; gap: 1.25rem; }
    .doc__pages-wrap[hidden] { display: none; }
    .page-canvas { display: block; background: var(--white); border-radius: 6px; box-shadow: 0 10px 30px rgba(35, 32, 82, 0.18), 0 1px 3px rgba(35, 32, 82, 0.12); }
    .msg { position: absolute; inset: 0; display: grid; place-items: center; margin: 0; padding: 2rem; color: var(--muted); text-align: center; }
    .msg strong { color: var(--indigo); }

    @media (max-width: 560px) { .doc__bar { padding: 0.75rem; } .doc__tools { width: 100%; justify-content: space-between; } }
  `,
})
export class ResumePage {
  protected readonly resumes = RESUMES;
  protected readonly selected = signal('');
  protected readonly status = signal<Status>('idle');
  protected readonly pages = signal(0);
  protected readonly zoom = signal(1);

  protected readonly current = computed(() => RESUMES.find((r) => r.id === this.selected()));
  protected readonly fileName = computed(() => `Othniel-Aryee-${this.current()?.label.replace(/\s+/g, '-') ?? 'Resume'}.pdf`);
  protected readonly url = computed(() => `resume/${this.selected()}.pdf`);

  private readonly body = viewChild<ElementRef<HTMLElement>>('body');
  private readonly wrap = viewChild<ElementRef<HTMLElement>>('pagesWrap');
  // the PDF library is only fetched when someone opens this page
  private lib?: Promise<typeof import('pdfjs-dist')>;
  private doc?: import('pdfjs-dist').PDFDocumentProxy;
  private renderId = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    // redraw when the zoom changes (a new document draws itself in choose())
    effect(() => {
      this.zoom();
      if (this.doc) void this.draw();
    });
    afterNextRender(() => {
      const el = this.body()?.nativeElement;
      if (!el) return;
      let last = el.clientWidth;
      const ro = new ResizeObserver(() => {
        if (Math.abs(el.clientWidth - last) > 4 && this.doc) {
          last = el.clientWidth;
          void this.draw();
        }
      });
      ro.observe(el);
      destroyRef.onDestroy(() => {
        ro.disconnect();
        void this.doc?.destroy();
      });
    });
  }

  protected zoomBy(step: number): void {
    this.zoom.update((z) => Math.min(2, Math.max(0.6, Math.round((z + step) * 100) / 100)));
  }

  protected async choose(id: string): Promise<void> {
    this.selected.set(id);
    this.status.set('checking');
    this.pages.set(0);
    this.zoom.set(1);
    void this.doc?.destroy();
    this.doc = undefined;
    this.wrap()?.nativeElement.replaceChildren();
    try {
      // the host answers unknown paths with the app itself, so a missing PDF shows up as "not a PDF"
      const head = await fetch(`resume/${id}.pdf`, { method: 'HEAD' });
      const isPdf = head.ok && (head.headers.get('content-type') ?? '').toLowerCase().includes('pdf');
      if (this.selected() !== id) return;
      if (!isPdf) return void this.status.set('missing');

      const pdfjs = await (this.lib ??= import('pdfjs-dist'));
      pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs/pdf.worker.min.mjs';
      const doc = await pdfjs.getDocument(`resume/${id}.pdf`).promise;
      if (this.selected() !== id) return void doc.destroy();
      this.doc = doc;
      this.pages.set(doc.numPages);
      this.status.set('ready');
      await this.draw();
    } catch {
      if (this.selected() === id) this.status.set('missing');
    }
  }

  /** Draw every page as a crisp canvas that fits the box's width (times the zoom). */
  private async draw(): Promise<void> {
    const doc = this.doc;
    const body = this.body()?.nativeElement;
    const wrap = this.wrap()?.nativeElement;
    if (!doc || !body || !wrap) return;
    const run = ++this.renderId;
    const available = body.clientWidth - parseFloat(getComputedStyle(body).paddingInline) * 2;
    const frag: HTMLCanvasElement[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      if (run !== this.renderId) return;
      const base = page.getViewport({ scale: 1 });
      const cssWidth = Math.min(available, 820) * this.zoom();
      const scale = cssWidth / base.width;
      const ratio = window.devicePixelRatio || 1;
      const viewport = page.getViewport({ scale: scale * ratio });
      const canvas = document.createElement('canvas');
      canvas.className = 'page-canvas';
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssWidth * (base.height / base.width)}px`;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      if (run !== this.renderId) return;
      frag.push(canvas);
    }
    wrap.replaceChildren(...frag);
  }
}
