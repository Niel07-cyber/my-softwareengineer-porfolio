import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUp } from '../core/count-up.directive';
import { Arrow } from './arrow';
import type { Experience } from '../core/profile.service';
import { Reveal } from '../core/reveal.directive';
import { slug } from './slug';
import { Tilt } from '../core/tilt.directive';

/** The home page's work-experience summary: a counted-up headline, a framed logo for each place, and a link to the full page. */
@Component({
  selector: 'app-experience-summary',
  imports: [RouterLink, Reveal, Tilt, CountUp, Arrow],
  template: `
    @let xp = summary();
    <p class="xp-lead">
      I've worked with
      <strong class="xp-lead__n" [appCountUp]="xp.companies">{{ xp.companies }}</strong>
      {{ xp.companies === 1 ? 'company' : 'companies' }}
      @if (xp.labs) {
        and <strong class="xp-lead__n" [appCountUp]="xp.labs">{{ xp.labs }}</strong>
        {{ xp.labs === 1 ? 'lab' : 'labs' }}
      }
      across <strong class="xp-lead__n" [appCountUp]="xp.countries">{{ xp.countries }}</strong>
      {{ xp.countries === 1 ? 'country' : 'countries' }}.
    </p>

    <ul class="logo-wall">
      @for (x of items(); track x.company) {
        <li class="logo-item" appReveal [style.--d]="$index * 0.25 + 's'">
          <a class="logo-item__link" [routerLink]="['/experience', slug(x.company)]" [attr.aria-label]="x.company + ': view experience details'">
            <div class="frame" appTilt>
              @if (x.logo) {
                <img [src]="x.logo" [alt]="x.company + ' logo'" />
              } @else {
                <span class="frame__mark" aria-hidden="true">{{ x.mark }}</span>
              }
            </div>
            <strong class="logo-item__name">{{ x.company }}</strong>
            @if (x.location) {
              <span class="logo-item__meta">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
                </svg>
                {{ x.location }}
              </span>
            }
            @if (x.kind === 'lab') {
              <span class="logo-item__kind">Research lab</span>
            }
          </a>
        </li>
      }
    </ul>

    <div class="more">
      <a routerLink="/experience" class="split-btn"><span class="split-btn__label">View all my work experiences</span><app-arrow /></a>
    </div>
  `,
  styles: `
    :host { display: block; }
    .more { display: flex; justify-content: center; margin-top: 1.5rem; }
.xp-lead {
  max-width: 44rem;
  margin: 0 0 1.5rem;
  color: var(--muted);
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  line-height: 1.5;
  strong { color: var(--coral); font-family: var(--font-heading); }
}

.logo-wall {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 1.75rem 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;

  // wide screens: one row, with a thin line threading the frames together
  @media (min-width: 900px) {
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    grid-template-columns: none;
  }
}

.logo-item {
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 0.25rem;
  text-align: center;

  @media (min-width: 900px) {
    &:not(:last-child)::after {
      content: '';
      position: absolute;
      z-index: 0;
      top: 55px; // centre of the frame
      left: 50%;
      width: 100%;
      border-top: 2px dashed #cfcbe8;
      transform-origin: left;
      transform: scaleX(0);
      transition: transform 0.8s ease calc(var(--d, 0s) + 0.5s);
    }
    &.reveal--in:not(:last-child)::after { transform: scaleX(1); }
  }

  &__link {
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 0.25rem;
    width: 100%;
    color: inherit;
    cursor: pointer;
    border-radius: var(--radius);
  }
  &__link:hover .logo-item__name { color: var(--coral); }
  &__link:focus-visible { outline: 3px solid var(--coral); outline-offset: 6px; }

  &__name { margin-top: 0.45rem; transition: color 0.2s; color: var(--indigo); font-family: var(--font-heading); font-size: 1.05rem; }
  &__meta { display: inline-flex; align-items: center; gap: 0.3rem; color: var(--muted); font-size: 0.88rem; svg { color: var(--coral); } }
  &__kind { margin-top: 0.2rem; padding: 0.15rem 0.65rem; border-radius: 999px; background: rgba(52, 47, 112, 0.08); color: var(--indigo); font: 600 0.72rem var(--font-heading); }
}

.frame {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: min(100%, 110px);
  aspect-ratio: 1;
  border: 3px solid transparent;
  border-radius: 28px;
  background:
    linear-gradient(var(--white), var(--white)) padding-box,
    linear-gradient(135deg, var(--coral), var(--indigo)) border-box;
  box-shadow: 0 10px 26px rgba(52, 47, 112, 0.08);
  transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.3s ease-out, box-shadow 0.3s;
  overflow: hidden;

  // soft spotlight that follows the cursor
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(248, 107, 73, 0.2), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &:hover { box-shadow: 0 18px 36px rgba(52, 47, 112, 0.18); }
  &:hover::after { opacity: 1; }

  img { position: relative; max-width: 84%; max-height: 62%; width: auto; height: auto; object-fit: contain; display: block; }
  &__mark {
    display: grid;
    place-items: center;
    width: 58%;
    aspect-ratio: 1;
    border-radius: 18px;
    background: linear-gradient(135deg, #4a43a0, var(--indigo));
    color: var(--white);
    font: 800 1.15rem var(--font-heading);
  }
}
  `,
})
export class ExperienceSummary {
  readonly items = input.required<Experience[]>();
  protected readonly slug = slug;

  // "4 companies and 1 lab across 4 countries", worked out from the list
  protected readonly summary = computed(() => {
    const xp = this.items();
    // "Remote" is a place to show, not a country to count
    const countries = new Set(
      xp.map((x) => x.location?.split(',').pop()?.trim()).filter((c) => c && c.toLowerCase() !== 'remote'),
    );
    const labs = xp.filter((x) => x.kind === 'lab').length;
    return { companies: xp.length - labs, labs, countries: countries.size };
  });
}
