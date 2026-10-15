import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../core/profile.service';

const SECTIONS = [
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Education', id: 'education' },
  { label: 'Skills', id: 'skills' },
  { label: 'Projects', id: 'projects' },
  { label: 'Contact', id: 'contact' },
];

/** On the home page the links are in-page anchors; on other pages they route back to the home sections. */
@Component({
  selector: 'app-site-header',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    <ng-template #brandInner>
      <span class="brand__mark" aria-hidden="true">{{ initials() }}</span>
      <span>{{ firstName() }}<span class="brand__dot">.</span></span>
    </ng-template>

    <header class="nav">
      <div class="container nav__inner">
        @if (home()) {
          <a href="#top" class="brand"><ng-container *ngTemplateOutlet="brandInner" /></a>
        } @else {
          <a routerLink="/" class="brand"><ng-container *ngTemplateOutlet="brandInner" /></a>
        }

        <nav aria-label="Main">
          <ul class="nav__links">
            @for (l of sections; track l.id) {
              <li>
                @if (home()) {
                  <a [href]="'#' + l.id">{{ l.label }}</a>
                } @else if (l.id === 'experience') {
                  <a routerLink="/experience" aria-current="page">{{ l.label }}</a>
                } @else {
                  <a routerLink="/" [fragment]="l.id">{{ l.label }}</a>
                }
              </li>
            }
          </ul>
        </nav>

        @if (home()) {
          <a href="#contact" class="btn btn--primary nav__cta">Hire me</a>
        } @else {
          <a routerLink="/" fragment="contact" class="btn btn--primary nav__cta">Hire me</a>
        }
      </div>
    </header>
  `,
  styles: `
    .nav {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(35, 32, 82, 0.92);
      backdrop-filter: blur(10px);
      color: var(--white);
    }
    .nav__inner { display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; padding-block: 0.9rem; }
    .nav__links { display: flex; gap: 2rem; font-weight: 500; margin: 0; padding: 0; list-style: none; }
    .nav__links a:hover, .nav__links a[aria-current='page'] { color: var(--coral); }
    .nav__cta { padding: 0.55rem 1.2rem; }

    .brand { display: inline-flex; align-items: center; gap: 0.6rem; font-family: var(--font-heading); font-weight: 800; font-size: 1.4rem; }
    .brand__mark {
      display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 50%;
      background: var(--coral); color: var(--white); font-size: 0.95rem; font-weight: 600;
    }
    .brand__dot { color: var(--coral); }

    @media (max-width: 900px) { .nav__links { display: none; } }
  `,
})
export class SiteHeader {
  private readonly profile = inject(ProfileService).profile;
  readonly home = input(false);
  protected readonly sections = SECTIONS;
  protected readonly firstName = computed(() => this.profile().name.split(' ')[0]);
  protected readonly initials = computed(() =>
    this.profile()
      .name.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
}
