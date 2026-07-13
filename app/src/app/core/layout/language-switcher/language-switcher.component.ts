import { Component, inject, input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { LocaleService } from '../../i18n/locale.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, SelectModule, TranslocoPipe],
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.css',
})
export class LanguageSwitcherComponent {
  readonly compact = input(false);
  readonly locale = inject(LocaleService);

  onLanguageChange(language: string): void {
    this.locale.setLanguage(language);
  }
}
