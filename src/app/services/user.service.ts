import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
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

  isSignedUp = signal<UserInterface | null>(
    JSON.parse(localStorage.getItem('response') || 'null')
  );

  isSignedUpSet(response: UserInterface) {
    localStorage.setItem('response', JSON.stringify(response));
    this.isSignedUp.set(response);
    this.router.navigateByUrl('/');
  }

  onSignup(signupData: UserSigninInterface): Observable<UserInterface> {
    return this.httpClient.post<UserInterface>(
      `${this.baseUrl}/login`,
      signupData
    );
  }

  onSignout() {
    localStorage.removeItem('response');
    this.isSignedUp.set(null);
    this.router.navigateByUrl('/');
  }
}
