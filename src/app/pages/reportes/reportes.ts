import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { forkJoin } from 'rxjs';
import { RoleService } from '../../core/role';
import { KafkaAnalyticsService } from '../../service/kafka-analytics.service';

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

  loading = false;
  errorMessage = '';

  resumen = {
    totalEnvios: 0,
    creados: 0,
    confirmados: 0,
    enBodega: 0,
    enRuta: 0,
    entregados: 0,
    cancelados: 0
  };

  estadosDetalle: Array<{ estado: string; cantidad: number }> = [];

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

    this.cargarMetricas();
  }

  cargarMetricas(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      statuses: this.kafkaService.getStatuses(),
      summary: this.kafkaService.getSummary()
    }).subscribe({
      next: ({ statuses, summary }) => {
        const byStatus = statuses?.byStatus ?? summary?.byStatus ?? {};

        const creados = byStatus['CREADO'] ?? 0;
        const confirmados = byStatus['ACEPTADO'] ?? 0;
        const enBodega = byStatus['EN_BODEGA'] ?? 0;
        const enRuta = byStatus['EN_RUTA'] ?? 0;
        const entregados = byStatus['ENTREGADO'] ?? 0;
        const cancelados = byStatus['CANCELADO'] ?? 0;

        const sumaEstados = Object.values(byStatus).reduce((acc, n) => acc + Number(n || 0), 0);
        const total = Number(summary?.totalProcessed ?? summary?.totalEvents ?? sumaEstados);

        this.resumen = {
          totalEnvios: total || sumaEstados,
          creados,
          confirmados,
          enBodega,
          enRuta,
          entregados,
          cancelados
        };

        this.estadosDetalle = Object.entries(byStatus).map(([estado, cantidad]) => ({
          estado,
          cantidad: Number(cantidad || 0)
        }));

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando analítica Kafka:', err);
        this.errorMessage = 'No se pudieron obtener las métricas desde el servicio de analítica.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
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

  logout(): void {
    this.authService.logoutRedirect();
  }
}