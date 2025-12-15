import { Component, computed, input } from '@angular/core';
import { Parking } from '../../../core/models/parking.interface';

@Component({
  selector: 'app-dashboard-stats',
  standalone: true,
  imports: [],
  templateUrl: './dashboard-stats.html',
  styleUrl: './dashboard-stats.css',
})
export class DashboardStats {
  readonly occupiedParkings = input.required<Parking[]>();
  readonly parkingSpots = input.required<number[]>();

  readonly totalSpots = computed(() => this.parkingSpots().length);
  readonly unavailableSpots = computed(() => this.occupiedParkings().length);

  readonly availableSpots = computed(() =>
    Math.max(this.totalSpots() - this.unavailableSpots(), 0)
  );

  readonly occupancyRate = computed(() => {
    const total = this.totalSpots();
    if (total === 0) return 0;

    return Math.round((this.unavailableSpots() / total) * 100);
  });
}
