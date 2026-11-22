import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { RoleService } from '../../core/role';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.css'
})
export class Auditoria implements OnInit {
  userName = 'Usuario';
  userEmail = '';
  userInitial = 'U';

  nuevoTopico = {
    nombre: '',
    particiones: 1
  };

  topicos = [
    { nombre: 'rutaexpress.shipments.events.v1', particiones: 1, replicacion: 1 }
  ];

  eventos: Array<{ eventId: string; shipmentId: string; estado: string; fecha: string }> = [];

  constructor(
    private authService: MsalService,
    public roleService: RoleService
  ) {}

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

  get canAccessShipments(): boolean {
    return this.roleService.canAccessShipments();
  }

  get canAccessCatalog(): boolean {
    return this.roleService.canAccessCatalog();
  }

  get canAccessReports(): boolean {
    return this.roleService.canAccessReports();
  }

  get canAccessAudit(): boolean {
    return this.roleService.canAccessAudit();
  }

  get canManageTopics(): boolean {
    return this.roleService.canManageTopics();
  }

  crearTopico(): void {
    if (!this.canManageTopics || !this.nuevoTopico.nombre.trim()) return;
    this.topicos.push({
      nombre: this.nuevoTopico.nombre.trim(),
      particiones: this.nuevoTopico.particiones,
      replicacion: 1
    });
    this.nuevoTopico.nombre = '';
  }

  eliminarTopico(nombre: string): void {
    if (!this.canManageTopics) return;
    this.topicos = this.topicos.filter(t => t.nombre !== nombre);
  }

  logout(): void {
    this.authService.logoutRedirect();
  }
}