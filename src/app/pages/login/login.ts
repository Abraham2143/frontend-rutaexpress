import { Component } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  constructor(
    private authService: MsalService
  ) {}

  login(): void {
    this.authService.loginRedirect({
      scopes: [
        'openid',
        'profile'
      ],
      prompt: 'select_account'
    });
  }

}