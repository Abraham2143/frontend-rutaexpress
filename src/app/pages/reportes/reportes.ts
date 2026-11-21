import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes implements OnInit {
  userName = 'Usuario';
  userEmail = '';
  userInitial = 'U';
  canAccessCatalog = true;

  resumen = {
    totalEnvios: 0,
    creados: 0,
    confirmados: 0,
    enRuta: 0,
    entregados: 0,
    cancelados: 0
  };

  constructor(private authService: MsalService) {}

  ngOnInit(): void {
    const account =
      this.authService.instance.getActiveAccount() ??
      this.authService.instance.getAllAccounts()[0];

    if (account) {
      this.userName = account.name || 'Usuario';
      this.userEmail = account.username || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }

  logout(): void {
    this.authService.logoutRedirect();
  }
}