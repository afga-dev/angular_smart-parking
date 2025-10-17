import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UserService } from './services/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSigninInterface } from './models/user-signin.interface';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  userService = inject(UserService);
  private formBuilder = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly signinError = signal<string | null>(null);

  showPassword = false;

  readonly signinForm = this.formBuilder.nonNullable.group({
    emailId: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.userService.getUserFromLocalStorage();
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.signinForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  async onSignin() {
    if (this.signinForm.invalid || this.isSubmitting()) return;

    const signinData: UserSigninInterface = this.signinForm.getRawValue();

    this.isSubmitting.set(true);
    this.signinError.set(null);

    try {
      const user = await firstValueFrom(this.userService.onSignup(signinData));
      this.userService.isSignedUpSet(user);
      this.signinForm.reset({
        emailId: '',
        password: '',
      });
    } catch (err) {
      this.signinError.set(`Email and/or password doesn't match.`);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
