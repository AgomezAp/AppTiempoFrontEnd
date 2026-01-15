import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AlertItem {
  Aid: number;
  Uid: number;
  Name: string;
  type: string;
  minutes: number;
  periodoInicio: string;
  periodoFin: string;
  notified: boolean;
  createdAt: string;
}

export interface AusentismoStats {
  summary: {
    totalRecords: number;
    totalHours: string;
    totalMinutes: number;
    averagePerRecord: number;
    uniqueUsers: number;
  };
  byUser: Array<{
    Uid: number;
    Name: string;
    totalHours: string;
    totalMinutes: number;
    count: number;
    average: number;
    byType: Array<{ type: string; hours: string; minutes: number; count: number }>;
  }>;
  byType: Array<{
    type: string;
    hours: string;
    minutes: number;
    count: number;
    percentage: string;
  }>;
  topAbsentees: any[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/api/admin`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAlerts(from?: string, to?: string): Observable<{ alerts: AlertItem[] }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ alerts: AlertItem[] }>(`${this.apiUrl}/alerts`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getAusentismoStats(from?: string, to?: string): Observable<{ success: boolean; stats: AusentismoStats }> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<{ success: boolean; stats: AusentismoStats }>(`${this.apiUrl}/ausentismo/stats`, {
      headers: this.getHeaders(),
      params,
    });
  }

  getAusentismoSummary(from?: string, to?: string): Observable<any> {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    return this.http.get<any>(`${this.apiUrl}/ausentismo/summary`, {
      headers: this.getHeaders(),
      params,
    });
  }
}

