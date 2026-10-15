import { Component, computed, inject } from '@angular/core';
import { HeroScene } from './hero-scene';
import { ProfileService } from '../../core/profile.service';

@Component({
  imports: [HeroScene],
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly initials = computed(() =>
    this.profile()
      .name.split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  );
  protected readonly techStack = computed(() =>
    this.profile()
      .skills.flatMap((g) => g.items)
      .slice(0, 12),
  );
  protected readonly year = new Date().getFullYear();
  protected readonly links = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Work', href: '#work' },
    { label: 'Contact', href: '#contact' },
  ];
}
