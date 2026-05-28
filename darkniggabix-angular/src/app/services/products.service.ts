import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Weapon } from '../models/weapon.model';
import { Drug } from '../models/drug.model';
import { Organ } from '../models/organ.model';

const API = 'http://localhost:3000/api/products';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  getWeapons(): Observable<Weapon[]> {
    return this.http.get<Weapon[]>(`${API}/weapons`);
  }
  addWeapon(data: Omit<Weapon, 'id'>): Observable<Weapon> {
    return this.http.post<Weapon>(`${API}/weapons`, data);
  }
  deleteWeapon(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/weapons/${id}`);
  }

  getDrugs(): Observable<Drug[]> {
    return this.http.get<Drug[]>(`${API}/drugs`);
  }
  addDrug(data: Omit<Drug, 'id'>): Observable<Drug> {
    return this.http.post<Drug>(`${API}/drugs`, data);
  }
  deleteDrug(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/drugs/${id}`);
  }

  getOrgans(): Observable<Organ[]> {
    return this.http.get<Organ[]>(`${API}/organs`);
  }
  addOrgan(data: Omit<Organ, 'id'>): Observable<Organ> {
    return this.http.post<Organ>(`${API}/organs`, data);
  }
  deleteOrgan(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/organs/${id}`);
  }
}
