import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  {
    path: 'report',
    loadComponent: () =>
      import('./pages/report.component/report.component').then(
        (c) => c.ReportComponent
      ),
  },
  {
    path: 'management',
    loadComponent: () =>
      import('./pages/management.component/management.component').then(
        (c) => c.ManagementComponent
      ),
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
