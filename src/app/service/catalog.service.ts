import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

/* =====================================================
   RESPUESTA REAL DEL BACKEND
===================================================== */

export interface CatalogBackendResponse {
  id: number;
  nombre: string;
  descripcion: string;
  tarifa: number;
  capacidadDisponible: number;
  activo: boolean;
}

/* =====================================================
   MODELO QUE UTILIZA EL FRONTEND
===================================================== */

export interface CatalogServiceItem {
  id: number;
  name: string;
  description: string;
  deliveryTime: string;
  price: number;
  capacity: number;
  status: 'Activo' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly apiUrl =
    API_CONFIG.baseUrl + API_CONFIG.endpoints.catalog;

  constructor(
    private http: HttpClient
  ) {}

  /* =====================================================
     DATOS MOCK (FALLBACK)
  ====================================================== */

  private readonly mockServices: CatalogServiceItem[] = [
    {
      id: 1,
      name: 'Estándar',
      description: 'Servicio de despacho económico para entregas regulares.',
      deliveryTime: '3 a 5 días',
      price: 4990,
      capacity: 120,
      status: 'Activo'
    },
    {
      id: 2,
      name: 'Express',
      description: 'Servicio rápido para envíos que requieren prioridad.',
      deliveryTime: '1 a 2 días',
      price: 7990,
      capacity: 75,
      status: 'Activo'
    },
    {
      id: 3,
      name: 'Same Day',
      description: 'Servicio de entrega durante el mismo día.',
      deliveryTime: 'Mismo día',
      price: 11990,
      capacity: 40,
      status: 'Activo'
    }
  ];

  /* =====================================================
     OBTENER SERVICIOS
  ====================================================== */

  getServices(): Observable<CatalogServiceItem[]> {
    if (API_CONFIG.useMocks) {
      return of(this.mockServices);
    }

    return this.http
      .get<CatalogBackendResponse[]>(this.apiUrl)
      .pipe(
        map((services: CatalogBackendResponse[]) => {
          console.log('Respuesta real del catálogo:', services);

          if (!services || !Array.isArray(services) || services.length === 0) {
            return this.mockServices;
          }

          return services.map(service =>
            this.mapBackendToFrontend(service)
          );
        }),
        catchError(error => {
          console.warn('Error de conexión o permisos con API Gateway. Cargando datos de respaldo:', error);
          return of(this.mockServices);
        })
      );
  }

  /* =====================================================
     BACKEND → FRONTEND
  ====================================================== */

  private mapBackendToFrontend(
    service: CatalogBackendResponse
  ): CatalogServiceItem {
    return {
      id: service.id,
      name: service.nombre,
      description: service.descripcion,
      deliveryTime: '3 a 5 días',
      price: service.tarifa,
      capacity: service.capacidadDisponible,
      status: service.activo ? 'Activo' : 'Inactivo'
    };
  }

}