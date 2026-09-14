import {
  Injectable
} from '@angular/core';

import {
  MsalService
} from '@azure/msal-angular';


/* =====================================================
   ROLES DE RUTAEXPRESS

   Estos valores coinciden directamente con:

   Microsoft Entra
   Backend BFF
   Frontend Angular
===================================================== */

export type UserRole =
  | 'ADMIN'
  | 'DISPATCHER'
  | 'CLIENT';


@Injectable({
  providedIn: 'root'
})
export class RoleService {


  private readonly storageKey =
    'rutaexpress-active-role';


  constructor(
    private authService: MsalService
  ) {}


  /* =====================================================
     OBTENER ROLES REALES DESDE MICROSOFT ENTRA
  ====================================================== */

  getAssignedRoles(): UserRole[] {


    const account =
      this.authService.instance.getActiveAccount()
      ??
      this.authService.instance.getAllAccounts()[0];


    if (!account) {

      return [];

    }


    const tokenRoles =
      account.idTokenClaims?.['roles'];


    const entraRoles: string[] =
      Array.isArray(tokenRoles)
        ? tokenRoles.filter(
            (role): role is string =>
              typeof role === 'string'
          )
        : [];


    const validRoles: UserRole[] = [
      'ADMIN',
      'DISPATCHER',
      'CLIENT'
    ];


    return validRoles.filter(
      role =>
        entraRoles.includes(role)
    );

  }


  /* =====================================================
     OBTENER ROL ACTIVO
  ====================================================== */

  getRole(): UserRole | null {


    const assignedRoles =
      this.getAssignedRoles();


    if (
      assignedRoles.length === 0
    ) {

      return null;

    }


    const storedRole =
      sessionStorage.getItem(
        this.storageKey
      );


    if (
      storedRole === 'ADMIN'
      ||
      storedRole === 'DISPATCHER'
      ||
      storedRole === 'CLIENT'
    ) {

      if (
        assignedRoles.includes(
          storedRole
        )
      ) {

        return storedRole;

      }

    }


    const defaultRole =
      assignedRoles[0];


    sessionStorage.setItem(
      this.storageKey,
      defaultRole
    );


    return defaultRole;

  }


  /* =====================================================
     CAMBIAR ROL ACTIVO
  ====================================================== */

  setRole(
    role: UserRole
  ): void {


    const assignedRoles =
      this.getAssignedRoles();


    if (
      !assignedRoles.includes(
        role
      )
    ) {

      return;

    }


    sessionStorage.setItem(
      this.storageKey,
      role
    );

  }


  /* =====================================================
     ALIAS
  ====================================================== */

  setActiveRole(
    role: UserRole
  ): void {

    this.setRole(
      role
    );

  }


  /* =====================================================
     LIMPIAR ROL
  ====================================================== */

  clearActiveRole(): void {

    sessionStorage.removeItem(
      this.storageKey
    );

  }


  /* =====================================================
     VALIDACIÓN DE ROLES
  ====================================================== */

  isAdmin(): boolean {

    return (
      this.getRole() ===
      'ADMIN'
    );

  }


  isDispatcher(): boolean {

    return (
      this.getRole() ===
      'DISPATCHER'
    );

  }


  isClient(): boolean {

    return (
      this.getRole() ===
      'CLIENT'
    );

  }


  /* =====================================================
     PERMISOS
  ====================================================== */


  /*
    Crear envío:

    CLIENT ✅
    DISPATCHER ✅
    ADMIN ❌
  */

  canCreateShipment(): boolean {

    const role =
      this.getRole();


    return (
      role === 'CLIENT'
      ||
      role === 'DISPATCHER'
    );

  }


  /*
    Cambiar estado:

    ADMIN ✅
    DISPATCHER ✅
    CLIENT ❌
  */

  canChangeShipmentStatus(): boolean {

    const role =
      this.getRole();


    return (
      role === 'ADMIN'
      ||
      role === 'DISPATCHER'
    );

  }


  /*
    Catálogo:

    ADMIN ✅
    DISPATCHER ✅
    CLIENT ❌
  */

  canAccessCatalog(): boolean {

    const role =
      this.getRole();


    return (
      role === 'ADMIN'
      ||
      role === 'DISPATCHER'
    );

  }

}