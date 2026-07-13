import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, ButtonModule],
  templateUrl: './forbidden.component.html',
})
export class ForbiddenComponent {}
