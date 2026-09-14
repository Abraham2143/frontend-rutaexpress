import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  of
} from 'rxjs';

import {
  API_CONFIG
} from '../core/api.config';


/* =========================================
   ESTADOS
========================================= */

export type ShipmentStatus =
  | 'CREADO'
  | 'ACEPTADO'
  | 'EN_BODEGA'
  | 'EN_RUTA'
  | 'ENTREGADO'
  | 'CANCELADO';


/* =========================================
   ENVÍO
========================================= */

export interface Shipment {

  id: string;

  customer: string;

  destination: string;

  serviceType: string;

  status: ShipmentStatus;

}


/* =========================================
   CREAR ENVÍO
========================================= */

export interface CreateShipmentRequest {

  customer: string;

  destination: string;

  serviceType: string;

}


@Injectable({
  providedIn: 'root'
})
export class ShipmentsService {


  private readonly apiUrl =
    API_CONFIG.baseUrl +
    API_CONFIG.endpoints.shipments;


  constructor(
    private http: HttpClient
  ) {}


  /* =========================================
     MOCKS
  ========================================= */

  private readonly mockShipments: Shipment[] = [

    {
      id: 'RX-1024',

      customer: 'Camila González',

      destination: 'Providencia',

      serviceType: 'Express',

      status: 'EN_RUTA'
    },

    {
      id: 'RX-1023',

      customer: 'Felipe Muñoz',

      destination: 'Las Condes',

      serviceType: 'Same Day',

      status: 'ENTREGADO'
    },

    {
      id: 'RX-1022',

      customer: 'Daniela Soto',

      destination: 'Ñuñoa',

      serviceType: 'Estándar',

      status: 'CREADO'
    },

    {
      id: 'RX-1021',

      customer: 'Martín Rojas',

      destination: 'San Miguel',

      serviceType: 'Express',

      status: 'EN_RUTA'
    }

  ];


  /* =========================================
     GET - LISTAR ENVÍOS
  ========================================= */

  getShipments(): Observable<Shipment[]> {


    if (API_CONFIG.useMocks) {

      return of(
        this.mockShipments
      );

    }


    return this.http.get<Shipment[]>(
      this.apiUrl
    );

  }


  /* =========================================
     GET - OBTENER ENVÍO
  ========================================= */

  getShipmentById(
    id: string
  ): Observable<Shipment | undefined> {


    if (API_CONFIG.useMocks) {

      return of(
        this.mockShipments.find(
          shipment =>
            shipment.id === id
        )
      );

    }


    return this.http.get<Shipment>(
      `${this.apiUrl}/${id}`
    );

  }


  /* =========================================
     POST - CREAR ENVÍO
  ========================================= */

  createShipment(
    shipment: CreateShipmentRequest
  ): Observable<Shipment> {


    if (API_CONFIG.useMocks) {

      const newShipment: Shipment = {

        id:
          'RX-' +
          (
            1021 +
            this.mockShipments.length
          ),

        customer:
          shipment.customer,

        destination:
          shipment.destination,

        serviceType:
          shipment.serviceType,

        status:
          'CREADO'

      };


      return of(
        newShipment
      );

    }


    return this.http.post<Shipment>(
      this.apiUrl,
      shipment
    );

  }


  /* =========================================
     PUT - CAMBIAR ESTADO
  ========================================= */

  updateShipmentStatus(
    id: string,
    status: ShipmentStatus
  ): Observable<Shipment> {


    if (API_CONFIG.useMocks) {

      const current =
        this.mockShipments.find(
          shipment =>
            shipment.id === id
        );


      const updated: Shipment = {

        id,

        customer:
          current?.customer ??
          '',

        destination:
          current?.destination ??
          '',

        serviceType:
          current?.serviceType ??
          '',

        status

      };


      return of(
        updated
      );

    }


    return this.http.put<Shipment>(
      `${this.apiUrl}/${id}/status`,
      {
        status
      }
    );

  }

}