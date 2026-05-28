import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Encarrec } from '../models/encarrec.model';

const API = 'http://localhost:3000/api/encarrecs';

@Injectable({ providedIn: 'root' })
export class EncarrecsService {
  private http = inject(HttpClient);

  getAll(): Observable<Encarrec[]> {
    return this.http.get<Encarrec[]>(API);
  }

  submit(data: Omit<Encarrec, 'id' | 'estat'>): Observable<Encarrec> {
    return this.http.post<Encarrec>(API, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
