import { Component } from '@angular/core';
import { DashboardFilter } from "../dashboard-filter/dashboard-filter";

@Component({
  selector: 'app-dashboard.component',
  imports: [DashboardFilter],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
