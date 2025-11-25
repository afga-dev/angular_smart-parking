import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { scrollToElement, scrollToTop } from '../../shared/utils/scroll.util';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private router = inject(Router);

  private authService = inject(AuthService);
  private userService = inject(UserService);

  readonly user = this.userService.user;

  onSignOut() {
    this.authService.signOutAndRedirect();
  }

  // Scroll helpers
  scrollToHome(): void {
    if (this.router.url === '/') {
      scrollToTop();
    } else {
      this.router.navigateByUrl('/');
    }
  }

  scrollToFooter(): void {
    if (document.getElementById('contact')) {
      scrollToElement('contact');
    }
  }
}
