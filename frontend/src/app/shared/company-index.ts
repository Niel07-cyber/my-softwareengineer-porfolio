import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Experience } from '../core/profile.service';
import { Arrow } from './arrow';
import { slug } from './slug';

/**
 * An editorial index of companies: huge names in rows. Hover a row and the others dim while that company's
 * logo card floats along with the cursor. Each row opens that company's page.
 */
@Component({
  selector: 'app-company-index',
  imports: [RouterLink, Arrow],
  host: { '(mouseleave)': 'active.set(-1)' },
  template: `
    <nav class="idx" [class.idx--hot]="active() >= 0" aria-label="Companies">
      @for (e of items(); track e.company; let i = $index) {
        <a
          class="row"
          [class.row--on]="active() === i"
          [routerLink]="['/experience', slug(e.company)]"
          (mouseenter)="active.set(i)"
          (focus)="active.set(i)"
          (blur)="active.set(-1)"
        >
          <span class="row__no">{{ i + 1 < 10 ? '0' : '' }}{{ i + 1 }}</span>
          <span class="row__name">
            <span class="row__logo" [style.--k]="zoom(e)">
              @if (e.logo) {
                <img [src]="e.logo" alt="" />
              } @else {
                <span class="row__mark">{{ e.mark }}</span>
              }
            </span>
            {{ e.company }}
          </span>
          <span class="row__role">{{ e.role ?? 'Details coming soon' }}</span>
          <span class="row__dates">{{ e.period }}</span>
          <app-arrow />
        </a>
      }

    </nav>
  `,
  styles: `
    :host { display: block; position: relative; }

    .idx { position: relative; border-top: 1px solid var(--line); }

    .row {
      display: grid; grid-template-columns: 3.5rem minmax(0, 1.7fr) minmax(0, 1fr) auto auto; align-items: center; gap: 1.25rem;
      padding: clamp(0.9rem, 1.8vw, 1.35rem) 0.25rem; border-bottom: 1px solid var(--line);
      color: var(--indigo); transition: opacity 0.3s, color 0.25s, padding 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .idx--hot .row:not(.row--on) { opacity: 0.28; }
    .row--on, .row:focus-visible { color: var(--coral); padding-left: 1.25rem; outline: none; }
    .row--on app-arrow, .row:focus-visible app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 3px; }

    .row__no { color: var(--muted); font: 700 clamp(1.1rem, 2vw, 1.5rem) var(--font-heading); letter-spacing: 0.05em; }
    .row__name { display: flex; align-items: center; gap: clamp(0.7rem, 1.6vw, 1.1rem); font: 800 clamp(1.2rem, 2.6vw, 1.9rem)/1.1 var(--font-heading); letter-spacing: -0.02em; white-space: nowrap; }
    .row__role { color: var(--ink); font-size: 0.95rem; font-weight: 500; }
    .row__dates { color: var(--muted); font: 600 0.82rem var(--font-heading); white-space: nowrap; }
    app-arrow { --arrow-size: 2.4rem; }

    .row__logo { flex: none; display: grid; place-items: center; width: calc(clamp(2.8rem, 5vw, 4rem) * 2); height: clamp(2.2rem, 3.6vw, 3rem);  }
    .row__logo img { max-width: calc(100% * var(--k, 1) / 2); max-height: 100%; width: auto; height: auto; object-fit: contain; display: block; }
    .row__mark { display: grid; place-items: center; width: 2.6rem; height: 2.6rem; border-radius: 10px; background: var(--indigo); color: var(--white); font: 800 0.85rem var(--font-heading); }

    @media (max-width: 800px) {
      .row__name { white-space: normal; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
      .row__logo { width: 7rem; height: 2.6rem; }
      .row { grid-template-columns: 2.4rem 1fr auto; gap: 0.25rem 0.9rem; }
      .row__role { grid-column: 2; grid-row: 2; font-size: 0.85rem; }
      .row__dates { grid-column: 2; grid-row: 3; font-size: 0.75rem; }
      .row app-arrow { grid-column: 3; grid-row: 1 / span 3; }
      .row--on { padding-left: 0.25rem; }
    }
    @media (hover: none) { .idx--hot .row:not(.row--on) { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { .row { transition: none; } }
  `,
})
export class CompanyIndex {
  readonly items = input.required<Experience[]>();
  protected readonly slug = slug;
  /** wide wordmarks read small next to square logos, so they get a wider box (and so a bigger logo) */
  protected zoom(e: Experience): number {
    return e.company.startsWith('Alstom') ? 2 : 1;
  }
  protected readonly active = signal(-1);
}
