import { Component, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Signin } from '../../core/models/signin.interface';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  private authService = inject(AuthService);
  private userService = inject(UserService);

  private _isLoading = signal<boolean>(false);
  readonly isLoading = this._isLoading.asReadonly();

  private _error = signal<string | null>(null);
  readonly error = this._error.asReadonly();

  readonly signinForm = this.formBuilder.nonNullable.group({
    emailId: [
      '',
      [Validators.required, Validators.maxLength(254), Validators.email],
    ],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  ngOnInit(): void {
    this.userService.loadUserFromLocalStorage();
  }

  async onSubmit(): Promise<void> {
    try {
      if (this.signinForm.invalid || this.isLoading()) return;

      this._isLoading.set(true);

      const signIn: Signin = this.signinForm.getRawValue();
      signIn.emailId = signIn.emailId.trim();
      signIn.password = signIn.password.trim();

      const user = await firstValueFrom(this.authService.login(signIn));
      this.userService.setUser(user);

      this.router.navigateByUrl('/');
    } catch (err) {
      this._error.set('Incorrect email or password.');
      // console.error(err);
    } finally {
      this._isLoading.set(false);
    }
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.signinForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }
}
