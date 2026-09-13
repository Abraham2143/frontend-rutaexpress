import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

import {
  RoleService,
  UserRole
} from '../../core/role';

@Component({
  selector: 'app-dashboard',

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  userName = 'Usuario';
  userEmail = '';
  userInitial = 'U';


  constructor(
    private authService: MsalService,
    public roleService: RoleService
  ) {}


  ngOnInit(): void {

    const account =
      this.authService.instance.getActiveAccount();

    if (account) {

      this.userName =
        account.name ?? 'Usuario';

      this.userEmail =
        account.username ?? '';

      this.userInitial =
        this.userName
          .charAt(0)
          .toUpperCase();


      /*
        Revisamos únicamente los claims.
        NO imprimimos ningún token.
      */
      const claims: any =
        account.idTokenClaims;


      console.log(
        'Claims de Microsoft:',
        {
          name: claims?.['name'],
          username:
            claims?.['preferred_username'],
          tenant:
            claims?.['tid'],
          audience:
            claims?.['aud'],
          roles:
            claims?.['roles']
        }
      );

    }

  }


  /* =========================
     ROLES
  ========================== */

  get currentRole(): UserRole {
    return this.roleService.getRole();
  }


  changeRole(role: UserRole): void {
    this.roleService.setRole(role);
  }


  get roleName(): string {

    if (this.currentRole === 'ADMIN') {
      return 'Administrador';
    }

    if (this.currentRole === 'DISPATCHER') {
      return 'Despachador';
    }

    return 'Cliente';

  }


  get isAdmin(): boolean {
    return this.roleService.isAdmin();
  }


  get isDispatcher(): boolean {
    return this.roleService.isDispatcher();
  }


  get isClient(): boolean {
    return this.roleService.isClient();
  }


  get canAccessCatalog(): boolean {
    return this.roleService.canAccessCatalog();
  }


  /* =========================
     CERRAR SESIÓN
  ========================== */

  logout(): void {

    this.authService.logoutRedirect({
      postLogoutRedirectUri:
        'http://localhost:4200/login'
    });

  }

}