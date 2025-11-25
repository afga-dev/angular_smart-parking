import { Component, inject, signal } from '@angular/core';
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
export class SigninComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  userService = inject(UserService);
  private formBuilder = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly signinError = signal<string | null>(null);

  showPassword = false;

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

  hasError(controlName: string, error: string): boolean {
    const control = this.signinForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  async onSignin() {
    if (this.signinForm.invalid || this.isSubmitting()) return;

    const signinData: Signin = this.signinForm.getRawValue();

    this.isSubmitting.set(true);
    this.signinError.set(null);

    try {
      const user = await firstValueFrom(this.authService.login(signinData));
      this.userService.setUser(user);
      this.signinForm.reset();
      this.router.navigateByUrl("/");
    } catch (err) {
      this.signinError.set('Incorrect email or password.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
