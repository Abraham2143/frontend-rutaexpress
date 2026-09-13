import { Injectable } from '@angular/core';

export type UserRole =
  'ADMIN' |
  'DISPATCHER' |
  'CLIENT';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  /*
    Como el tenant institucional no permite
    asignar App Roles, usamos CLIENT como
    vista inicial de demostración.
  */
  private currentRole: UserRole =
    this.loadRole();


  private loadRole(): UserRole {

    if (typeof window !== 'undefined') {

      const savedRole =
        sessionStorage.getItem(
          'rutaexpress-demo-role'
        );

      if (
        savedRole === 'ADMIN' ||
        savedRole === 'DISPATCHER' ||
        savedRole === 'CLIENT'
      ) {

        return savedRole;
      }

    }

    return 'CLIENT';
  }


  getRole(): UserRole {
    return this.currentRole;
  }


  setRole(role: UserRole): void {

    this.currentRole = role;

    if (typeof window !== 'undefined') {

      sessionStorage.setItem(
        'rutaexpress-demo-role',
        role
      );

    }

  }


  isAdmin(): boolean {
    return this.currentRole === 'ADMIN';
  }


  isDispatcher(): boolean {
    return this.currentRole === 'DISPATCHER';
  }


  isClient(): boolean {
    return this.currentRole === 'CLIENT';
  }


  canCreateShipment(): boolean {

    return (
      this.currentRole === 'CLIENT' ||
      this.currentRole === 'DISPATCHER'
    );

  }


  canChangeShipmentStatus(): boolean {

    return (
      this.currentRole === 'ADMIN' ||
      this.currentRole === 'DISPATCHER'
    );

  }


  canAccessCatalog(): boolean {

    return (
      this.currentRole === 'ADMIN' ||
      this.currentRole === 'DISPATCHER'
    );

  }

}