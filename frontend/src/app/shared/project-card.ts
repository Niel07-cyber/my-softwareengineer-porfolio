import { Component, computed, input } from '@angular/core';
import type { Project } from '../core/profile.service';
import { Arrow } from './arrow';

/**
 * A project card with a cover on top. The cover is the project's image when it has one; otherwise it is generated
 * art (soft colour blobs on indigo, with a big outlined number), shifted per project so each looks different.
 */
@Component({
  selector: 'app-project-card',
  imports: [Arrow],
  template: `
    @let p = project();
    <a class="pc" [class.pc--wide]="wide()" [href]="p.link" [attr.target]="external() ? '_blank' : null" [attr.rel]="external() ? 'noopener' : null">
      <div class="pc__cover" [style.--h]="hue()">
        @if (p.image) {
          <img class="pc__img" [src]="p.image" [alt]="p.title + ' cover'" />
        }
        @if (p.category) {
          <span class="pc__cat">{{ p.category }}</span>
        }
        @if (p.year) {
          <span class="pc__year">{{ p.year }}</span>
        }
        <span class="pc__num" aria-hidden="true">{{ number() }}</span>
      </div>

      <div class="pc__body">
        <h3>{{ p.title }}</h3>
        <p>{{ p.description }}</p>
        <ul class="pc__tags">
          @for (t of p.tags; track t) {
            <li>{{ t }}</li>
          }
        </ul>
        <div class="pc__foot">
          <span class="pc__gh">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path fill="currentColor" d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
            <span>GitHub</span>
          </span>
          <span class="split-btn split-btn--sm pc__go">
            <span class="split-btn__label">View project</span>
            <app-arrow />
          </span>
        </div>
      </div>
    </a>
  `,
  styles: `
    :host { display: block; height: 100%; }
    ul, h3, p { margin: 0; padding: 0; list-style: none; }

    .pc {
      display: flex; flex-direction: column; height: 100%; overflow: hidden;
      background: var(--white); border: 1px solid var(--line); border-radius: var(--radius);
      transition: border-color 0.25s;
    }
    .pc:hover { border-color: var(--coral); }

    .pc__cover {
      position: relative; aspect-ratio: 16 / 9; overflow: hidden; isolation: isolate;
      background:
        radial-gradient(circle at 18% 22%, rgba(248, 107, 73, 0.85), transparent 46%),
        radial-gradient(circle at 82% 78%, hsl(var(--h, 250) 70% 62% / 0.85), transparent 52%),
        radial-gradient(circle at 70% 15%, hsl(calc(var(--h, 250) + 40) 80% 70% / 0.45), transparent 40%),
        linear-gradient(135deg, #342f70, #232052);
      transition: filter 0.4s;
    }
    .pc:hover .pc__cover { filter: saturate(1.2) brightness(1.05); }
    /* the featured card is two rows tall: its cover takes the extra height */
    .pc--wide .pc__cover { aspect-ratio: auto; flex: 1; min-height: 14rem; }
    .pc--wide .pc__body { flex: none; }
    @media (max-width: 960px) { .pc--wide .pc__cover { aspect-ratio: 16 / 8; flex: none; } }
    .pc__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -1; }

    /* big outlined number, like a catalogue index */
    .pc__num {
      position: absolute; left: 1rem; bottom: -0.35rem; font: 800 clamp(3.2rem, 8vw, 5rem) var(--font-heading); line-height: 1;
      color: transparent; -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.55); letter-spacing: -0.02em;
    }
    .pc__cat, .pc__year {
      position: absolute; top: 1rem; padding: 0.25rem 0.8rem; border-radius: 999px; color: var(--white);
      background: rgba(255, 255, 255, 0.16); border: 1px solid rgba(255, 255, 255, 0.3); backdrop-filter: blur(6px);
      font: 600 0.75rem var(--font-heading); letter-spacing: 0.04em;
    }
    .pc__cat { left: 1rem; }
    .pc__year { right: 1rem; }

    .pc__body { display: flex; flex-direction: column; flex: 1; gap: 0.6rem; padding: 1.4rem 1.5rem 1.5rem; }
    .pc__body h3 { color: var(--indigo); font-size: 1.25rem; }
    .pc__body p { color: var(--muted); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .pc__tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.2rem; }
    .pc__tags li { padding: 0.2rem 0.7rem; border-radius: 999px; background: var(--surface); color: var(--indigo); font-size: 0.78rem; font-weight: 600; }
    .pc__foot { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-top: auto; padding-top: 0.4rem; }
    .pc__gh { display: inline-flex; align-items: center; gap: 0.45rem; color: var(--indigo); font: 600 0.85rem var(--font-heading); transition: color 0.2s; }
    .pc:hover .pc__gh { color: var(--coral); }
    .pc:hover .split-btn__label { background: #d9d6f0; }
    .pc:hover app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 3px; }
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly index = input(0);
  readonly wide = input(false);

  protected readonly number = computed(() => String(this.index() + 1).padStart(2, '0'));
  protected readonly hue = computed(() => 235 + ((this.index() * 37) % 120));
  protected readonly external = computed(() => /^https?:\/\//.test(this.project().link));
}
