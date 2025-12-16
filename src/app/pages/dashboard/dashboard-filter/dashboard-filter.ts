import {
  Component,
  inject,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { Building } from '../../../core/models/building.interface';
import { Floor } from '../../../core/models/floor.interface';
import { Parking } from '../../../core/models/parking.interface';
import { LocationService } from '../../../core/services/location.service';
import { firstValueFrom, Observable } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { Site } from '../../../core/models/site.interface';

type LocationLevel = 'site' | 'building' | 'floor';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [NgSelectComponent, FormsModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.css',
})
export class DashboardFilter implements OnInit {
  private userService = inject(UserService);
  private locationService = inject(LocationService);

  readonly occupiedParkingsChange = output<Parking[]>();
  readonly parkingSpotsChange = output<number[]>();
  readonly selectedFloorChange = output<number | null>();

  readonly _sites = signal<Site[]>([]);
  readonly sites = this._sites.asReadonly();

  readonly _buildings = signal<Building[]>([]);
  readonly buildings = this._buildings.asReadonly();

  readonly _floors = signal<Floor[]>([]);
  readonly floors = this._floors.asReadonly();

  readonly _isLoading = signal<boolean>(true);
  readonly isLoading = this._isLoading.asReadonly();

  readonly _occupiedParkings = signal<Parking[]>([]);
  readonly _parkingSpots = signal<number[]>([]);

  readonly _user = this.userService.user;

  selectedSite: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;

  ngOnInit(): void {
    this.loadingLocations();
  }

  private async loadingLocations(): Promise<void> {
    try {
      const userId = Number(this._user()?.extraId);
      if (!userId) return;

      const sites = await firstValueFrom(this.locationService.getSites(userId));

      this._sites.set(sites.data);
    } catch (err) {
      // console.error(err);
    } finally {
      this._isLoading.set(false);
    }
  }

  async onSiteChange(site: Site | null): Promise<void> {
    this.resetFrom('site');

    if (!site?.siteId) return;

    await this.fetchAndSet(
      this.locationService.getBuildings(site.siteId),
      this._buildings
    );
  }

  async onBuildingChange(building: Building | null): Promise<void> {
    this.resetFrom('building');

    if (!building?.buildingId) return;

    await this.fetchAndSet(
      this.locationService.getFloors(building.buildingId),
      this._floors
    );
  }

  async onFloorChange(floor: Floor | null): Promise<void> {
    this.resetFrom('floor');

    if (!floor?.floorId) return;

    await this.fetchAndSet(
      this.locationService.getParkings(floor.floorId),
      this._occupiedParkings
    );

    this.selectedFloor = floor.floorId;

    this._parkingSpots.set(
      Array.from({ length: floor.totalParkingSpots }, (_, i) => i + 1)
    );

    this.emitState();
  }

  private resetFrom(level: LocationLevel): void {
    if (level === 'site') {
      this._buildings.set([]);
      this.selectedBuilding = null;
    }

    if (level === 'site' || level === 'building') {
      this._floors.set([]);
      this.selectedFloor = null;
    }

    this._occupiedParkings.set([]);
    this._parkingSpots.set([]);

    this.emitStateIfSelectionIncomplete();
  }

  private emitStateIfSelectionIncomplete(): void {
    if (
      this.selectedSite === null ||
      this.selectedBuilding === null ||
      this.selectedFloor === null
    )
      this.emitState();
  }

  private async fetchAndSet<T>(
    source$: Observable<{ data: T[] | null }>,
    target: WritableSignal<T[]>
  ): Promise<void> {
    try {
      const response = await firstValueFrom(source$);
      target.set(response.data ?? []);
    } catch {
      target.set([]);
    }
  }

  private emitState(): void {
    this.occupiedParkingsChange.emit(this._occupiedParkings());
    this.parkingSpotsChange.emit(this._parkingSpots());
    this.selectedFloorChange.emit(this.selectedFloor);
  }
}
