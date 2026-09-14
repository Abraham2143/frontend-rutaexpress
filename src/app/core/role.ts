import { Injectable } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

export type UserRole = 'ADMIN' | 'DISPATCHER' | 'CLIENT';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private readonly ACTIVE_ROLE_KEY = 'rutaexpress-active-role';

  constructor(private authService: MsalService) {}

  /**
   * Obtiene los roles reales entregados por Microsoft Entra.
   */
  getAssignedRoles(): UserRole[] {

    const account =
      this.authService.instance.getActiveAccount() ??
      this.authService.instance.getAllAccounts()[0];

    if (!account) {
      return [];
    }

    const claims = account.idTokenClaims as
      | { roles?: string[] }
      | undefined;

    const tokenRoles = claims?.roles ?? [];

    const validRoles: UserRole[] = [
      'ADMIN',
      'DISPATCHER',
      'CLIENT'
    ];

    return validRoles.filter(role =>
      tokenRoles.includes(role)
    );
  }

  /**
   * Obtiene el rol actualmente activo en la interfaz.
   */
  getRole(): UserRole | null {

    const assignedRoles = this.getAssignedRoles();

    if (assignedRoles.length === 0) {
      return null;
    }

    const savedRole = sessionStorage.getItem(
      this.ACTIVE_ROLE_KEY
    ) as UserRole | null;

    if (
      savedRole &&
      assignedRoles.includes(savedRole)
    ) {
      return savedRole;
    }

    /**
     * Si tiene más de un rol:
     * ADMIN tiene prioridad,
     * luego DISPATCHER,
     * luego CLIENT.
     */
    const priority: UserRole[] = [
      'ADMIN',
      'DISPATCHER',
      'CLIENT'
    ];

    const defaultRole =
      priority.find(role =>
        assignedRoles.includes(role)
      ) ?? assignedRoles[0];

    sessionStorage.setItem(
      this.ACTIVE_ROLE_KEY,
      defaultRole
    );

    return defaultRole;
  }

  /**
   * Cambia la vista activa solamente si el usuario
   * realmente posee ese rol en Microsoft Entra.
   */
  setRole(role: UserRole): boolean {

    const assignedRoles = this.getAssignedRoles();

    if (!assignedRoles.includes(role)) {

      console.warn(
        `El usuario no posee el rol ${role}`
      );

      return false;
    }

    sessionStorage.setItem(
      this.ACTIVE_ROLE_KEY,
      role
    );

    return true;
  }

  hasRole(role: UserRole): boolean {
    return this.getAssignedRoles().includes(role);
  }

  hasAnyRole(): boolean {
    return this.getAssignedRoles().length > 0;
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isDispatcher(): boolean {
    return this.getRole() === 'DISPATCHER';
  }

  isClient(): boolean {
    return this.getRole() === 'CLIENT';
  }

  canCreateShipment(): boolean {

    const role = this.getRole();

    return (
      role === 'CLIENT' ||
      role === 'DISPATCHER'
    );
  }

  canChangeShipmentStatus(): boolean {

    const role = this.getRole();

    return (
      role === 'ADMIN' ||
      role === 'DISPATCHER'
    );
  }

  canAccessCatalog(): boolean {

    const role = this.getRole();

    return (
      role === 'ADMIN' ||
      role === 'DISPATCHER'
    );
  }

  clearActiveRole(): void {

    sessionStorage.removeItem(
      this.ACTIVE_ROLE_KEY
    );
  }
}