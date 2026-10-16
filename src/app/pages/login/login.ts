import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { API_SCOPE } from '../../core/auth.config';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  constructor(
    private authService: MsalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const activeAccount = 
      this.authService.instance.getActiveAccount() || 
      this.authService.instance.getAllAccounts()[0];

    if (activeAccount) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.authService.loginRedirect({
      scopes: ['openid', 'profile', API_SCOPE],
      prompt: 'select_account'
    });
  }

}