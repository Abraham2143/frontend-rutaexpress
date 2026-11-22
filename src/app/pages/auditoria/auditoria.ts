import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { RoleService } from '../../core/role';
import { KafkaAnalyticsService, KafkaTopicItem } from '../../service/kafka-analytics.service';

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

  loadingTopics = false;
  loadingEvents = false;
  savingTopic = false;
  mostrarModalCrear = false;
  errorMessage = '';
  modalErrorMessage = '';

  nuevoTopico = {
    nombre: '',
    particiones: 1,
    replicacion: 1
  };

  topicos: KafkaTopicItem[] = [];
  eventos: Array<{ eventId: string; shipmentId: string; estado: string; fecha: string }> = [];

  constructor(
    private authService: MsalService,
    public roleService: RoleService,
    private kafkaService: KafkaAnalyticsService,
    private cdr: ChangeDetectorRef
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

    this.cargarTopicos();
    this.cargarEventos();
  }

  cargarTopicos(): void {
    this.loadingTopics = true;
    this.kafkaService.getTopics().subscribe({
      next: (lista) => {
        this.topicos = lista.filter((t) => !t.nombre.startsWith('__'));
        this.loadingTopics = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error listando tópicos Kafka:', err);
        this.errorMessage = 'No se pudieron cargar los tópicos del clúster Kafka.';
        this.loadingTopics = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarEventos(): void {
    this.loadingEvents = true;
    this.kafkaService.getRecentEvents(20).subscribe({
      next: (lista) => {
        this.eventos = (lista ?? []).map((ev, idx) => {
          const rawFecha = String(
            ev.occurredAt ?? ev.processedAt ?? ev.timestamp ?? ev.createdAt ?? '-'
          );
          return {
            eventId: String(ev.eventId ?? ev.id ?? `EVT-${idx + 1}`),
            shipmentId: String(ev.trackingNumber ?? ev.shipmentId ?? '-'),
            estado: String(ev.status ?? ev.newStatus ?? ev.eventType ?? '-'),
            fecha: this.formatearFecha(rawFecha)
          };
        });
        this.loadingEvents = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando bitácora de eventos:', err);
        this.loadingEvents = false;
        this.cdr.detectChanges();
      }
    });
  }

  private formatearFecha(raw: string): string {
    if (!raw || raw === '-') return '-';

    const normalized = raw.replace(/(\.\d{3})\d+Z$/, '$1Z');
    const date = new Date(normalized);

    if (isNaN(date.getTime())) {
      return raw.includes('T') ? raw.split('T')[0] : raw;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
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

  abrirModalCrear(): void {
    if (!this.canManageTopics) return;
    this.nuevoTopico = {
      nombre: '',
      particiones: 1,
      replicacion: 1
    };
    this.modalErrorMessage = '';
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    if (this.savingTopic) return;
    this.mostrarModalCrear = false;
    this.modalErrorMessage = '';
  }

  crearTopico(): void {
    const nombre = this.nuevoTopico.nombre.trim();
    const particiones = Number(this.nuevoTopico.particiones) || 1;
    const replicacion = Number(this.nuevoTopico.replicacion) || 1;

    if (!this.canManageTopics || this.savingTopic) return;

    if (!nombre) {
      this.modalErrorMessage = 'Ingresa el nombre del tópico.';
      return;
    }

    this.savingTopic = true;
    this.modalErrorMessage = '';
    this.errorMessage = '';

    this.kafkaService.createTopic(nombre, particiones, replicacion).subscribe({
      next: () => {
        this.savingTopic = false;
        this.mostrarModalCrear = false;
        this.nuevoTopico = { nombre: '', particiones: 1, replicacion: 1 };
        this.cargarTopicos();
      },
      error: (err) => {
        console.error('Error creando tópico:', err);
        this.modalErrorMessage =
          err?.error?.message ||
          'No se pudo crear el tópico en Kafka (verifica que la replicación no supere los brokers activos).';
        this.savingTopic = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logoutRedirect();
  }
}