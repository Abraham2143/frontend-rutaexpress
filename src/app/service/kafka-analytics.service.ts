import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { API_CONFIG } from '../core/api.config';

export interface StatusAnalyticsResponse {
  byStatus: Record<string, number>;
}

export interface AnalyticsSummaryResponse {
  totalEvents?: number;
  totalProcessed?: number;
  totalFailed?: number;
  byStatus?: Record<string, number>;
  [key: string]: unknown;
}

export interface RecentShipmentEvent {
  eventId?: string;
  id?: string;
  shipmentId?: string | number;
  trackingNumber?: string;
  status?: string;
  newStatus?: string;
  eventType?: string;
  occurredAt?: string;
  processedAt?: string;
  timestamp?: string;
  createdAt?: string;
}

export interface TopicListResponse {
  count: number;
  topics: string[];
}

export interface KafkaTopicItem {
  nombre: string;
  particiones: number;
  replicacion: number;
}

export interface CreateTopicRequest {
  name: string;
  partitions: number;
  replicationFactor: number;
}

@Injectable({
  providedIn: 'root'
})
export class KafkaAnalyticsService {
  private readonly analyticsUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.analytics}`;
  private readonly kafkaUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.kafka}`;

  constructor(private http: HttpClient) {}

  /* =========================
     ANALÍTICA Y REPORTES
  ========================== */
  getStatuses(): Observable<StatusAnalyticsResponse> {
    return this.http.get<StatusAnalyticsResponse>(`${this.analyticsUrl}/statuses`);
  }

  getSummary(): Observable<AnalyticsSummaryResponse> {
    return this.http.get<AnalyticsSummaryResponse>(`${this.analyticsUrl}/summary`);
  }

  getRecentEvents(limit = 20): Observable<RecentShipmentEvent[]> {
    const params = new HttpParams().set('limit', limit);
    return this.http.get<RecentShipmentEvent[]>(`${this.analyticsUrl}/recent`, { params });
  }

  /* =========================
     ADMINISTRACIÓN DE TÓPICOS
  ========================== */
  getTopics(): Observable<KafkaTopicItem[]> {
    return this.http.get<TopicListResponse>(`${this.kafkaUrl}/topics`).pipe(
      switchMap((res) => {
        const names = res?.topics ?? [];
        if (names.length === 0) {
          return of([]);
        }
        const detailRequests = names.map((name) =>
          this.http.get<Record<string, unknown>>(`${this.kafkaUrl}/topics/${encodeURIComponent(name)}`).pipe(
            map((detail) => {
              const partitionsRaw = detail['partitions'];
              const partitionCount = Array.isArray(partitionsRaw)
                ? partitionsRaw.length
                : Number(partitionsRaw ?? detail['partitionCount'] ?? 1);
              const replication = Number(detail['replicationFactor'] ?? 1);
              return {
                nombre: name,
                particiones: partitionCount || 3,
                replicacion: replication || 3
              };
            }),
            catchError(() => of({ nombre: name, particiones: 3, replicacion: 3 }))
          )
        );
        return forkJoin(detailRequests);
      })
    );
  }

  createTopic(name: string, partitions = 3, replicationFactor = 3): Observable<unknown> {
    const body: CreateTopicRequest = {
      name,
      partitions,
      replicationFactor
    };
    return this.http.post(`${this.kafkaUrl}/topics`, body);
  }

  deleteTopic(topicName: string): Observable<void> {
    return this.http.delete<void>(`${this.kafkaUrl}/topics/${encodeURIComponent(topicName)}`);
  }
}