import { Component, inject, signal } from '@angular/core';
import { DashboardFilter } from '../dashboard-filter/dashboard-filter';
import { DashboardStats } from '../dashboard-stats/dashboard-stats';
import { Parking } from '../../../core/models/parking.interface';
import { DashboardSpots } from '../dashboard-spots/dashboard-spots';
import { LocationService } from '../../../core/services/location.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardFilter, DashboardStats, DashboardSpots],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private locationService = inject(LocationService);

  readonly occupiedParkings = signal<Parking[]>([]);
  readonly parkingSpots = signal<number[]>([]);
  readonly selectedFloor = signal<number | null>(null);

  updateOccupiedParkings = (parkings: Parking[]) => {
    this.occupiedParkings.set(parkings);
  };

  updateParkingSpots = (spots: number[]) => {
    this.parkingSpots.set(spots);
  };

  updateSelectedFloor = (floor: number | null) => {
    this.selectedFloor.set(floor);
  }

  async refreshParkings() {
    const floorId = this.selectedFloor();
    if (!floorId) return;

    const refreshed = await firstValueFrom(
      this.locationService.getParkings(floorId)
    );

    this.occupiedParkings.set(refreshed.data ?? []);
  }
}
