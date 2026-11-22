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
  errorMessage = '';

  nuevoTopico = {
    nombre: '',
    particiones: 1
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

    // Recorta nanosegundos a milisegundos para asegurar compatibilidad al parsear ISO UTC
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

  esTopicoProtegido(nombre: string): boolean {
    const protegidos = [
      'rutaexpress.shipments.events.v1',
      'rutaexpress.shipments.analytics.v1',
      'rutaexpress.shipments.events.v1.DLT',
      'rutaexpress.shipments.analytics.v1.DLT'
    ];
    return protegidos.includes(nombre) || nombre.endsWith('.DLT');
  }

  crearTopico(): void {
    const nombre = this.nuevoTopico.nombre.trim();
    if (!this.canManageTopics || !nombre || this.savingTopic) return;

    this.savingTopic = true;
    this.errorMessage = '';

    this.kafkaService.createTopic(nombre, this.nuevoTopico.particiones || 1).subscribe({
      next: () => {
        this.nuevoTopico.nombre = '';
        this.nuevoTopico.particiones = 1;
        this.savingTopic = false;
        this.cargarTopicos();
      },
      error: (err) => {
        console.error('Error creando tópico:', err);
        this.errorMessage = err?.error?.message || 'No se pudo crear el tópico en Kafka.';
        this.savingTopic = false;
        this.cdr.detectChanges();
      }
    });
  }

  eliminarTopico(nombre: string): void {
    if (!this.canManageTopics || this.esTopicoProtegido(nombre)) return;

    this.errorMessage = '';
    this.kafkaService.deleteTopic(nombre).subscribe({
      next: () => {
        this.cargarTopicos();
      },
      error: (err) => {
        console.error('Error eliminando tópico:', err);
        if (err?.status === 409) {
          this.errorMessage =
            'Este tópico está protegido por el sistema y solo puede administrarse directamente desde Apache Kafka.';
        } else {
          this.errorMessage = err?.error?.message || `No se pudo eliminar el tópico ${nombre}.`;
        }
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.authService.logoutRedirect();
  }
}