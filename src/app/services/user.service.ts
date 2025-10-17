import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { UserInterface } from '../models/user.interface';
import { API_URL } from '../app.config';
import { HttpClient } from '@angular/common/http';
import { UserSigninInterface } from '../models/user-signin.interface';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private httpClient = inject(HttpClient);
  private baseUrl = inject(API_URL);
  private router = inject(Router);

  isSignedUp = signal<UserInterface | null>(null);
  isLoaded = signal<boolean>(false);

  async getUserFromLocalStorage() {
    const storedId = localStorage.getItem('id');
    if (storedId) {
      const user = await firstValueFrom(this.getUser(Number(storedId)));
      this.isSignedUp.set(user);
    }
    this.isLoaded.set(true);
  }

  isSignedUpSet(user: UserInterface) {
    localStorage.setItem('id', user.userId.toString());
    this.isSignedUp.set(user);
    this.router.navigateByUrl('/');
  }

  onSignup(signupData: UserSigninInterface): Observable<UserInterface> {
    return this.httpClient.post<UserInterface>(
      `${this.baseUrl}/login`,
      signupData
    );
  }

  getUser(id: number): Observable<UserInterface> {
    return this.httpClient.get<UserInterface>(
      `${this.baseUrl}/getUserById?id=${id}`
    );
  }

  onSignout() {
    localStorage.removeItem('id');
    this.isSignedUp.set(null);
    this.router.navigateByUrl('/');
  }
}
