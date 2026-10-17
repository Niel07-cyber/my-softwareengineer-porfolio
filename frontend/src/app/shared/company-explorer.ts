import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Experience } from '../core/profile.service';
import { Arrow } from './arrow';
import { slug } from './slug';

/**
 * A pick-from-the-list layout: the places I've worked are a plain list on the left; choosing one shows its picture,
 * a short summary and a link to the full story on the right.
 */
@Component({
  selector: 'app-company-explorer',
  imports: [RouterLink, Arrow],
  template: `
    <div class="ex">
      <div class="ex__side">
        <p class="ex__count">Places ({{ items().length }})</p>
        <div class="ex__list" role="tablist" aria-label="Places I've worked" aria-orientation="vertical" (keydown)="onKey($event)">
          @for (e of items(); track e.company; let i = $index) {
            <button
              type="button"
              role="tab"
              [id]="'ex-tab-' + i"
              [attr.aria-selected]="i === index()"
              [attr.aria-controls]="'ex-panel'"
              [attr.tabindex]="i === index() ? 0 : -1"
              [class.on]="i === index()"
              (click)="index.set(i)"
            >
              {{ e.company }}
            </button>
          }
        </div>
      </div>

      <!-- re-created whenever the choice changes, so each new place fades in -->
      @for (e of [current()]; track e.company) {
        <article class="ex__panel" id="ex-panel" role="tabpanel" [attr.aria-labelledby]="'ex-tab-' + index()">
          <div class="cover" [style.--h]="hue()">
            <span class="cover__logo">
              @if (e.logo) {
                <img [src]="e.logo" [alt]="e.company + ' logo'" />
              } @else {
                <span class="cover__mark" aria-hidden="true">{{ e.mark }}</span>
              }
            </span>
          </div>

          <div class="copy">
          <h2>{{ e.company }}</h2>
          <p class="role">
            {{ e.role ?? 'Details coming soon' }}
            @if (e.kind === 'lab') {
              <span class="tag">{{ e.tag ?? 'Research lab' }}</span>
            }
          </p>
          @if (e.fullName) {
            <p class="full">{{ e.fullName }}</p>
          }
          <p class="summary">{{ summary(e) }}</p>

          <a class="split-btn go" [routerLink]="['/experience', slug(e.company)]">
            <span class="split-btn__label">View full story</span><app-arrow />
          </a>
          </div>
        </article>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    h2, p { margin: 0; padding: 0; }

    .ex { display: grid; grid-template-columns: minmax(12rem, 17rem) minmax(0, 1fr); gap: clamp(2rem, 5vw, 4rem); align-items: start; }

    /* the list: plain names, the chosen one in coral */
    .ex__side { position: sticky; top: 6rem; min-width: 0; }
    .ex__count { margin-bottom: 1rem; color: var(--muted); font: 700 0.8rem var(--font-heading); letter-spacing: 0.12em; text-transform: uppercase; }
    .ex__list { display: grid; gap: 0.35rem; }
    .ex__list button {
      position: relative; padding: 0.55rem 0 0.55rem 1.4rem; border: 0; background: none; text-align: left; cursor: pointer;
      color: var(--indigo); font: 600 1.15rem/1.3 var(--font-heading); transition: color 0.2s, transform 0.25s;
    }
    .ex__list button::before {
      content: ''; position: absolute; left: 0.1rem; top: 50%; width: 0.5rem; height: 0.5rem; margin-top: -0.25rem; border-radius: 50%;
      background: currentColor; opacity: 0.35; transition: opacity 0.2s, transform 0.25s;
    }
    .ex__list button:hover { color: var(--coral); }
    .ex__list button.on { color: var(--coral); transform: translateX(4px); }
    .ex__list button.on::before { opacity: 1; transform: scale(1.3); }
    .ex__list button:focus-visible { outline: 3px solid var(--coral); outline-offset: 2px; border-radius: 8px; }

    /* the picture: the company's logo on a coloured cover, like the project covers */
    /* the picture on the left, the words on the right, so nothing needs scrolling */
    .ex__panel { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: clamp(1.25rem, 3vw, 2.25rem); align-items: center; animation: swap 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; min-width: 0; }
    .copy { min-width: 0; }
    @keyframes swap { from { opacity: 0; transform: translateY(10px); } }
    .cover {
      position: relative; display: grid; place-items: center; aspect-ratio: 4 / 4.2; overflow: hidden; border-radius: 22px; isolation: isolate;
      background:
        radial-gradient(circle at 15% 20%, rgba(248, 107, 73, 0.85), transparent 46%),
        radial-gradient(circle at 85% 80%, hsl(var(--h, 250) 70% 62% / 0.85), transparent 52%),
        radial-gradient(circle at 68% 12%, hsl(calc(var(--h, 250) + 40) 80% 70% / 0.45), transparent 40%),
        linear-gradient(135deg, #342f70, #232052);
    }
        .cover__logo {
      display: grid; place-items: center; position: relative; width: min(88%, 16rem); aspect-ratio: 1.22 / 1; border-radius: 20px; overflow: hidden; background: var(--white);
      box-shadow: 0 18px 40px rgba(10, 8, 40, 0.35);
    }
    /* the white card is one fixed shape for every company; its logo is laid inside it (not in the flow), so a tall logo can't stretch the card */
    .cover__logo img { position: absolute; inset: 9% 7%; display: block; width: 86%; height: 82%; object-fit: contain; }
    .cover__mark { color: var(--indigo); font: 800 1.8rem var(--font-heading); }

    h2 { margin-top: 0; color: var(--indigo); font-size: clamp(1.9rem, 3.4vw, 2.6rem); font-weight: 800; letter-spacing: -0.02em; }
    .role { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; margin-top: 0.3rem; color: var(--coral); font: 700 1.15rem var(--font-heading); }
    .tag { padding: 0.15rem 0.7rem; border-radius: 999px; background: rgba(52, 47, 112, 0.08); color: var(--indigo); font-size: 0.78rem; }
    .full { margin-top: 0.25rem; color: var(--muted); font-size: 0.92rem; }
    .summary { max-width: 46rem; margin-top: 1rem; color: var(--muted); font-size: 1.1rem; line-height: 1.65; }
    .go { margin-top: 2rem; }

    @media (max-width: 900px) {
      .ex { grid-template-columns: 1fr; gap: 1.5rem; }
      .ex__side { position: static; }
      .ex__list { min-width: 0; max-width: 100%; }
      .ex__count { display: none; }
      /* the list becomes a row you can swipe */
      .ex__list { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.4rem; scrollbar-width: none; }
      .ex__list::-webkit-scrollbar { display: none; }
      .ex__list button { flex: none; padding: 0.5rem 1rem; border: 1px solid var(--line); border-radius: 999px; font-size: 0.95rem; white-space: nowrap; }
      .ex__list button::before { display: none; }
      .ex__list button.on { transform: none; border-color: var(--coral); background: rgba(248, 107, 73, 0.08); }

    }
    @media (max-width: 640px) {
      .ex__panel { grid-template-columns: 1fr; align-items: start; }
      .cover { aspect-ratio: 16 / 10; }
      .cover__logo { width: min(52%, 11rem); }
      }
    @media (prefers-reduced-motion: reduce) { .ex__panel { animation: none; } }
  `,
})
export class CompanyExplorer {
  readonly items = input.required<Experience[]>();
  protected readonly slug = slug;
  protected readonly index = signal(0);
  protected readonly current = computed(() => this.items()[Math.min(this.index(), this.items().length - 1)]);
  protected readonly hue = computed(() => 235 + ((this.index() * 37) % 120));

  /** One short paragraph: the first thing I did there (the full list is on the company's own page). */
  protected summary(e: Experience): string {
    return e.highlights?.[0] ?? 'The full story for this one is coming soon.';
  }

  /** Up and down arrows move through the list, as in any tab list. */
  protected onKey(event: KeyboardEvent): void {
    const last = this.items().length - 1;
    let next = this.index();
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = Math.min(next + 1, last);
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = Math.max(next - 1, 0);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    else return;
    event.preventDefault();
    this.index.set(next);
    queueMicrotask(() => document.getElementById('ex-tab-' + next)?.focus());
  }
}
