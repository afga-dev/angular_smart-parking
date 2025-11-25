import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.token';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = inject(API_URL);
  private httpClient = inject(HttpClient);

  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  private _isLoaded = signal<boolean>(false);
  readonly isLoaded = this._isLoaded.asReadonly();

  async loadUserFromLocalStorage(): Promise<void> {
    const storedId = localStorage.getItem('id');

    if (storedId) {
      const user = await firstValueFrom(this.fetchUser(Number(storedId)));
      this._user.set(user);
    }

    this._isLoaded.set(true);
  }

  setUser(user: User): void {
    localStorage.setItem('id', user.userId.toString());
    this._user.set(user);
  }

  deleteUser(): void {
    localStorage.removeItem('id');
    this._user.set(null);
  }

  fetchUser(id: number): Observable<User> {
    return this.httpClient.get<User>(`${this.baseUrl}/getuserbyid?id=${id}`);
  }
}
