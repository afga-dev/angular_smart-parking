import { Component, signal } from '@angular/core';
import { DashboardFilter } from '../dashboard-filter/dashboard-filter';
import { DashboardStats } from '../dashboard-stats/dashboard-stats';
import { Parking } from '../../../core/models/parking.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardFilter, DashboardStats],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly occupiedParkings = signal<Parking[]>([]);
  readonly parkingSpots = signal<number[]>([]);

  updateOccupiedParkings = (parkings: Parking[]) => {
    this.occupiedParkings.set(parkings);
  };

  updateParkingSpots = (spots: number[]) => {
    this.parkingSpots.set(spots);
  };
}
