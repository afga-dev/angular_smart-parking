import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserService } from './core/services/user.service';
import { SigninComponent } from './pages/signin.component/signin.component';
import { NavbarComponent } from './pages/navbar.component/navbar.component';
import { FooterComponent } from './pages/footer.component/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SigninComponent, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  userService = inject(UserService);

  user = computed(() => this.userService.user());
  isLoaded = computed(() => this.userService.isLoaded());

  ngOnInit(): void {
    this.userService.loadUserFromLocalStorage();
  }
}
