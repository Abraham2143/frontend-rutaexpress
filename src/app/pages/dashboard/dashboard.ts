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
  standalone: true,

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
      this.authService.instance.getActiveAccount()
      ?? this.authService.instance.getAllAccounts()[0];

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
        Revisamos los claims entregados
        por Microsoft Entra.

        No mostramos el token completo.
      */
      const claims = account.idTokenClaims as
        | {
            name?: string;
            preferred_username?: string;
            tid?: string;
            aud?: string;
            roles?: string[];
          }
        | undefined;


      console.log(
        'Claims de Microsoft:',
        {
          name: claims?.name,
          username:
            claims?.preferred_username,
          tenant:
            claims?.tid,
          audience:
            claims?.aud,
          roles:
            claims?.roles
        }
      );


      console.log(
        'Roles válidos de RutaExpress:',
        this.roleService.getAssignedRoles()
      );

    }

  }


  /* =========================
     ROLES
  ========================== */

  /**
   * Rol actualmente seleccionado
   * para mostrar la interfaz.
   */
  get currentRole(): UserRole | null {

    return this.roleService.getRole();

  }


  /**
   * Roles reales que Microsoft Entra
   * asignó al usuario.
   */
  get assignedRoles(): UserRole[] {

    return this.roleService.getAssignedRoles();

  }


  /**
   * Indica si debemos mostrar
   * selector de rol.
   */
  get hasMultipleRoles(): boolean {

    return this.assignedRoles.length > 1;

  }


  /**
   * Cambia el rol activo.
   *
   * RoleService valida que el usuario
   * realmente posea ese rol.
   */
  changeRole(role: UserRole): void {

    this.roleService.setRole(role);

  }


  /**
   * Traduce los valores técnicos
   * de Microsoft a nombres visibles.
   */
  getRoleName(role: UserRole): string {

    const names: Record<UserRole, string> = {
      ADMIN: 'Administrador',
      DISPATCHER: 'Despachador',
      CLIENT: 'Cliente'
    };

    return names[role];

  }


  /**
   * Nombre del rol actualmente activo.
   */
  get roleName(): string {

    const role = this.currentRole;

    if (!role) {
      return 'Sin rol asignado';
    }

    return this.getRoleName(role);

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

    /*
      Eliminamos el rol activo guardado.

      Así, si después inicia sesión
      otra persona, no hereda la vista
      del usuario anterior.
    */
    this.roleService.clearActiveRole();


    this.authService.logoutRedirect({
      postLogoutRedirectUri:
        'http://localhost:4200/login'
    });

  }

}