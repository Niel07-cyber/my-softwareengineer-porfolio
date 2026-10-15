import { Component, inject } from '@angular/core';
import { ProfileService } from '../../core/profile.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly year = new Date().getFullYear();
  protected readonly links = [
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Work', href: '#work' },
    { label: 'Contact', href: '#contact' },
  ];
}
