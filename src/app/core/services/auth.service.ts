import { inject, Injectable, signal } from '@angular/core';
import { Signin } from '../models/signin.interface';
import { User } from '../models/user.interface';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.token';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = inject(API_URL);
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  private userService = inject(UserService);

  private _isFooterVisible = signal<boolean>(false);
  readonly isFooterVisible = this._isFooterVisible.asReadonly();

  login(user: Signin): Observable<User> {
    return this.httpClient.post<User>(`${this.baseUrl}/login`, user);
  }

  signOutAndRedirect(): void {
    this.userService.deleteUser();
    this.router.navigateByUrl('/');
  }

  setFooterVisible(state: boolean): void {
    this._isFooterVisible.set(state);
  }
}
