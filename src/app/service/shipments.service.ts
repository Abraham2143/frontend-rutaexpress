import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

/* =====================================================
   ESTADOS
===================================================== */
export type ShipmentStatus =
  | 'CREADO'
  | 'ACEPTADO'
  | 'EN_BODEGA'
  | 'EN_RUTA'
  | 'ENTREGADO'
  | 'CANCELADO';

/* =====================================================
   RESPUESTA DEL BACKEND
===================================================== */
export interface ShipmentResponse {
  id: number;
  trackingNumber: string;
  clienteId: string;
  destinatarioNombre: string;
  destinatarioEmail: string;
  direccionOrigen: string;
  direccionDestino: string;
  servicioId: number;
  status: ShipmentStatus;
  fechaCreacion: string;
  fechaAceptacion: string | null;
  fechaEntrega: string | null;
  creadoPor: string;
}

/* =====================================================
   CREAR ENVÍO
===================================================== */
export interface CreateShipmentRequest {
  clienteId: string;
  destinatarioNombre: string;
  destinatarioEmail: string;
  direccionOrigen: string;
  direccionDestino: string;
  servicioId: number;
}

/* =====================================================
   CAMBIAR ESTADO
===================================================== */
export interface UpdateShipmentStatusRequest {
  status: ShipmentStatus;
  comment?: string; // 👈 Soporte para observaciones del chofer/sucursal
}

/* =====================================================
   SERVICIO
===================================================== */
@Injectable({
  providedIn: 'root'
})
export class ShipmentsService {
  private readonly apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.shipments}`;

  constructor(private http: HttpClient) {}

  /* =========================
     LISTAR ENVÍOS
  ========================== */
  getShipments(
    status?: ShipmentStatus,
    from?: string,
    to?: string
  ): Observable<ShipmentResponse[]> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }
    if (from) {
      params = params.set('from', from);
    }
    if (to) {
      params = params.set('to', to);
    }

    return this.http.get<ShipmentResponse[]>(this.apiUrl, { params });
  }

  /* =========================
     BUSCAR POR ID
  ========================== */
  getShipmentById(id: number): Observable<ShipmentResponse> {
    return this.http.get<ShipmentResponse>(`${this.apiUrl}/${id}`);
  }

  /* =========================
     CREAR ENVÍO
  ========================== */
  createShipment(request: CreateShipmentRequest): Observable<ShipmentResponse> {
    return this.http.post<ShipmentResponse>(this.apiUrl, request);
  }

  /* =========================
     CAMBIAR ESTADO
  ========================== */
  updateStatus(
    id: number,
    status: ShipmentStatus,
    comment?: string
  ): Observable<ShipmentResponse> {
    const request: UpdateShipmentStatusRequest = {
      status,
      comment
    };

    return this.http.put<ShipmentResponse>(
      `${this.apiUrl}/${id}/status`,
      request
    );
  }
}