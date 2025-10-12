import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard.component/dashboard.component';
import { ReportComponent } from './pages/report.component/report.component';
import { ManagementComponent } from './pages/management.component/management.component';

export const routes: Routes = [
    { path: '', component: DashboardComponent },
    { path: 'report', component: ReportComponent },
    { path: 'management', component: ManagementComponent },
    { path: '**', redirectTo: '', pathMatch: 'full'}
];
