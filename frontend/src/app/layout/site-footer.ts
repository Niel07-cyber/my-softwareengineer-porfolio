import { Component, inject } from '@angular/core';
import { ProfileService } from '../core/profile.service';
import { SocialIcon } from '../shared/social-icon';

@Component({
  imports: [SocialIcon],
  selector: 'app-site-footer',
  template: `
    @let p = profile();
    <footer class="footer">
      <div class="container footer__inner">
        <span>© {{ year }} {{ p.name }}</span>
        <ul>
          @for (s of p.socials; track s.label) {
            <li><a [href]="s.url" target="_blank" rel="noopener"><app-social-icon [name]="s.label" />{{ s.label }}</a></li>
          }
        </ul>
      </div>
    </footer>
  `,
  styles: `
    .footer { background: var(--indigo-deep); color: rgba(255, 255, 255, 0.75); font-size: 0.9rem; }
    .footer__inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem; padding-block: 1.5rem; }
    ul { display: flex; flex-wrap: wrap; gap: 0.6rem 1.25rem; margin: 0; padding: 0; list-style: none; }
    a { display: inline-flex; align-items: center; gap: 0.5rem; --icon-size: 1.2rem; }
    a:hover { color: var(--coral); }
  `,
})
export class SiteFooter {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly year = new Date().getFullYear();
}
