import { Component, input } from '@angular/core';

/**
 * A round arrow button face: a navy circle with a thin white arrow (tone "dark"), or a lavender circle with a
 * navy arrow (tone "light"). Size and colour can be overridden with --arrow-size, --arrow-bg and --arrow-nudge.
 */
@Component({
  selector: 'app-arrow',
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" [style.rotate]="rotation()">
      <path d="M4.5 12h15M13.5 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `,
  host: { '[class.arrow--light]': "tone() === 'light'" },
  styles: `
    :host {
      display: inline-grid;
      place-items: center;
      flex: none;
      width: var(--arrow-size, 2.5rem);
      aspect-ratio: 1;
      border-radius: 50%;
      background: var(--arrow-bg, var(--indigo-deep));
      color: var(--arrow-fg, var(--white));
      transition: background 0.2s, color 0.2s;
    }
    :host(.arrow--light) { background: var(--arrow-bg, #e6e4f2); color: var(--arrow-fg, var(--indigo)); }
    svg { width: 52%; height: 52%; transition: transform 0.25s; transform: translateX(var(--arrow-nudge, 0)); }
  `,
})
export class Arrow {
  readonly dir = input<'right' | 'left' | 'down'>('right');
  readonly tone = input<'dark' | 'light'>('dark');

  protected rotation(): string {
    return this.dir() === 'left' ? '180deg' : this.dir() === 'down' ? '90deg' : '0deg';
  }
}
