import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

export interface CatalogBackendResponse {
  id: number;
  nombre: string;
  descripcion: string;
  tarifa: number;
  capacidadDisponible: number;
  activo: boolean;
}

export interface CatalogServiceItem {
  id: number;
  idServicio: number;
  servicioId: number;
  nombre: string;
  name: string;
  descripcion: string;
  description: string;
  tiempoEntrega: string;
  deliveryTime: string;
  tarifa: number;
  price: number;
  capacidadDisponible: number;
  capacity: number;
  activo: boolean;
  status: 'Activo' | 'Inactivo';
}

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  private readonly apiUrl =
    API_CONFIG.baseUrl + API_CONFIG.endpoints.catalog;

  constructor(private http: HttpClient) {}

  /* =====================================================
     DATOS POR DEFECTO (CON TARIFAS Y PROPIEDADES COMPLETAS)
  ====================================================== */

  private readonly mockServices: CatalogServiceItem[] = [
    {
      id: 1,
      idServicio: 1,
      servicioId: 1,
      nombre: 'Estándar',
      name: 'Estándar',
      descripcion: 'Servicio de despacho económico para entregas regulares.',
      description: 'Servicio de despacho económico para entregas regulares.',
      tiempoEntrega: '3 a 5 días',
      deliveryTime: '3 a 5 días',
      tarifa: 4990,
      price: 4990,
      capacidadDisponible: 120,
      capacity: 120,
      activo: true,
      status: 'Activo'
    },
    {
      id: 2,
      idServicio: 2,
      servicioId: 2,
      nombre: 'Express',
      name: 'Express',
      descripcion: 'Servicio rápido para envíos que requieren prioridad.',
      description: 'Servicio rápido para envíos que requieren prioridad.',
      tiempoEntrega: '1 a 2 días',
      deliveryTime: '1 a 2 días',
      tarifa: 7990,
      price: 7990,
      capacidadDisponible: 75,
      capacity: 75,
      activo: true,
      status: 'Activo'
    },
    {
      id: 3,
      idServicio: 3,
      servicioId: 3,
      nombre: 'Same Day',
      name: 'Same Day',
      descripcion: 'Servicio de entrega durante el mismo día.',
      description: 'Servicio de entrega durante el mismo día.',
      tiempoEntrega: 'Mismo día',
      deliveryTime: 'Mismo día',
      tarifa: 11990,
      price: 11990,
      capacidadDisponible: 40,
      capacity: 40,
      activo: true,
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
          if (!services || !Array.isArray(services) || services.length === 0) {
            return this.mockServices;
          }

          return services.map(service => this.mapBackendToFrontend(service));
        }),
        catchError(error => {
          console.warn('Error al conectar con el backend de catálogo. Cargando datos locales:', error);
          return of(this.mockServices);
        })
      );
  }

  private mapBackendToFrontend(service: CatalogBackendResponse): CatalogServiceItem {
    const tarifaValida = service.tarifa && service.tarifa > 0 ? service.tarifa : 4990;

    return {
      id: service.id,
      idServicio: service.id,
      servicioId: service.id,
      nombre: service.nombre || 'Servicio Estándar',
      name: service.nombre || 'Servicio Estándar',
      descripcion: service.descripcion || 'Servicio de despacho',
      description: service.descripcion || 'Servicio de despacho',
      tiempoEntrega: '3 a 5 días',
      deliveryTime: '3 a 5 días',
      tarifa: tarifaValida,
      price: tarifaValida,
      capacidadDisponible: service.capacidadDisponible || 50,
      capacity: service.capacidadDisponible || 50,
      activo: service.activo ?? true,
      status: service.activo ? 'Activo' : 'Inactivo'
    };
  }

}