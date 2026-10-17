import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CountUp } from '../core/count-up.directive';
import { Arrow } from './arrow';
import type { Experience } from '../core/profile.service';
import { Reveal } from '../core/reveal.directive';
import { slug } from './slug';

/** The home page's work-experience summary: a counted-up headline, the three latest places as compact tiles, and a link to the full page. */
@Component({
  selector: 'app-experience-summary',
  imports: [RouterLink, CountUp, Arrow, Reveal],
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

    <!-- the three most recent places as compact tiles; "Explore it all" shows the rest -->
    <div class="row">
      @for (x of shown(); track x.company; let i = $index) {
        <a
          class="tile"
          [class.tile--wide]="x.company.startsWith('Alstom')"
          [routerLink]="['/experience', slug(x.company)]"
          appReveal
          [style.--d]="i * 0.12 + 's'"
          [attr.aria-label]="x.company + ': view experience details'"
        >
          <span class="tile__logo">
            @if (x.logo) {
              <img [src]="x.logo" [alt]="x.company + ' logo'" />
            } @else {
              <span class="tile__mark" aria-hidden="true">{{ x.mark }}</span>
            }
          </span>
          <span class="tile__body">
            <strong class="tile__name">{{ x.company }}</strong>
            @if (x.role) {
              <span class="tile__role">{{ x.role }}</span>
            }
          </span>
          <app-arrow class="tile__go" />
        </a>
      }
    </div>

    <div class="more">
      <a routerLink="/experience" class="split-btn"><span class="split-btn__label">Explore it all</span><app-arrow /></a>
    </div>
  `,
  styles: `
    :host { display: block; }
.xp-lead {
  max-width: 44rem;
  margin: 0 0 clamp(2.5rem, 5vw, 3.75rem);
  color: var(--muted);
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  line-height: 1.5;
  strong { color: var(--coral); font-family: var(--font-heading); }
}

    .row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.1rem; }

    .tile {
      position: relative; display: flex; align-items: center; gap: 1.1rem; padding: 1.1rem 4.2rem 1.1rem 1.1rem;
      background: var(--white); border: 1px solid var(--line); border-radius: 20px;
      transition: border-color 0.25s, transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
    }
    .tile:hover, .tile:focus-visible { border-color: var(--coral); transform: translateY(-3px); box-shadow: 0 14px 30px rgba(52, 47, 112, 0.1); }
    .tile:hover app-arrow, .tile:focus-visible app-arrow { --arrow-bg: var(--coral); --arrow-nudge: 3px; }

    .tile__logo {
      flex: none; display: grid; place-items: center; width: 5.4rem; height: 4rem; border-radius: 14px; border: 2px solid transparent;
      background: linear-gradient(var(--white), var(--white)) padding-box, linear-gradient(135deg, var(--coral), var(--indigo)) border-box;
    }
    .tile__logo img { display: block; max-width: 84%; max-height: 78%; width: auto; height: auto; object-fit: contain; }
    .tile--wide .tile__logo img { max-width: 92%; }
    .tile__mark { font: 800 1rem var(--font-heading); color: var(--indigo); }
    .tile__body { display: grid; gap: 0.1rem; min-width: 0; }
    .tile__name { color: var(--indigo); font: 700 1.1rem/1.2 var(--font-heading); }
    .tile__role { color: var(--muted); font-size: 0.88rem; line-height: 1.35; }
    .tile__go { position: absolute; right: 1rem; top: 50%; margin-top: -1.1rem; --arrow-size: 2.2rem; }

    .more { display: flex; justify-content: center; margin-top: 2rem; }

    @media (max-width: 960px) {
      .row { grid-template-columns: 1fr; }
    }
    @media (prefers-reduced-motion: reduce) { .tile { transition: none; } }
  `,
})
export class ExperienceSummary {
  readonly items = input.required<Experience[]>();
  protected readonly slug = slug;
  /** the home page previews the three most recent; the Work experience page lists them all */
  protected readonly shown = computed(() => this.items().slice(0, 3));
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
