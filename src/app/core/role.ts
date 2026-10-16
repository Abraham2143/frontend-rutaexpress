import {
  Injectable
} from '@angular/core';

import {
  MsalService
} from '@azure/msal-angular';


/* =====================================================
   ROLES DE RUTAEXPRESS
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
     OBTENER ROLES REALES DESDE MICROSOFT ENTRA (CON FALLBACK)
  ====================================================== */

  getAssignedRoles(): UserRole[] {

    const validRoles: UserRole[] = [
      'ADMIN',
      'DISPATCHER',
      'CLIENT'
    ];

    const account =
      this.authService.instance.getActiveAccount()
      ??
      this.authService.instance.getAllAccounts()[0];


    if (!account) {
      return validRoles;
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


    const filtered = validRoles.filter(
      role => entraRoles.includes(role)
    );

    // Si Microsoft Entra no envió roles en el token, habilitamos los roles de prueba
    return filtered.length > 0 ? filtered : validRoles;

  }


  /* =====================================================
     OBTENER ROL ACTIVO
  ====================================================== */

  getRole(): UserRole {

    const assignedRoles =
      this.getAssignedRoles();


    const storedRole =
      sessionStorage.getItem(
        this.storageKey
      );


    if (
      storedRole === 'ADMIN' ||
      storedRole === 'DISPATCHER' ||
      storedRole === 'CLIENT'
    ) {

      if (assignedRoles.includes(storedRole)) {
        return storedRole;
      }

    }


    const defaultRole: UserRole = assignedRoles[0] || 'ADMIN';


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

    this.setRole(role);

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

    return this.getRole() === 'ADMIN';

  }


  isDispatcher(): boolean {

    return this.getRole() === 'DISPATCHER';

  }


  isClient(): boolean {

    return this.getRole() === 'CLIENT';

  }


  /* =====================================================
     PERMISOS
  ====================================================== */

  canCreateShipment(): boolean {

    const role = this.getRole();

    return role === 'CLIENT' || role === 'DISPATCHER' || role === 'ADMIN';

  }


  canChangeShipmentStatus(): boolean {

    const role = this.getRole();

    return role === 'ADMIN' || role === 'DISPATCHER';

  }


  canAccessCatalog(): boolean {

    return true; // Permitir acceso al catálogo a todos los usuarios autenticados

  }

}