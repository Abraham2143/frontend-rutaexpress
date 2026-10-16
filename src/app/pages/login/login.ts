import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { API_SCOPE } from '../../core/auth.config';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  constructor(private authService: MsalService) {}

  login(): void {
    this.authService.loginRedirect({
      scopes: ['openid', 'profile', API_SCOPE],
      prompt: 'select_account'
    });
  }
}