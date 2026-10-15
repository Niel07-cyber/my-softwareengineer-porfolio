import { Component, inject } from '@angular/core';
import { ProfileService } from '../core/profile.service';

@Component({
  selector: 'app-site-footer',
  template: `
    @let p = profile();
    <footer class="footer">
      <div class="container footer__inner">
        <span>© {{ year }} {{ p.name }}</span>
        <ul>
          @for (s of p.socials; track s.label) {
            <li><a [href]="s.url" target="_blank" rel="noopener">{{ s.label }}</a></li>
          }
        </ul>
      </div>
    </footer>
  `,
  styles: `
    .footer { background: var(--indigo-deep); color: rgba(255, 255, 255, 0.75); font-size: 0.9rem; }
    .footer__inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-block: 1.5rem; }
    ul { display: flex; gap: 1.5rem; margin: 0; padding: 0; list-style: none; }
    a:hover { color: var(--coral); }
  `,
})
export class SiteFooter {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly year = new Date().getFullYear();
}
