import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { firstValueFrom } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { UserService } from '../../services/user.service';
import { SiteInterface } from '../../models/site-response.interface';
import { BuildingInterface } from '../../models/building-response.interface';
import { FloorInterface } from '../../models/floor-response.interface';
import { ParkingInterface } from '../../models/parking-response.interface';
import { AddParkingInterface } from '../../models/parking.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private clientService = inject(ClientService);
  private formBuilder = inject(FormBuilder);

  readonly sites = signal<SiteInterface[]>([]);
  readonly buildings = signal<BuildingInterface[]>([]);
  readonly floors = signal<FloorInterface[]>([]);
  readonly parkings = signal<ParkingInterface[]>([]);
  readonly parkingSpots = signal<number[]>([]);

  readonly showReserveModal = signal(false);
  readonly showReleaseModal = signal(false);

  selectedSite: number | null = null;
  selectedBuilding: number | null = null;
  selectedFloor: number | null = null;
  selectedReserve: number | null = null;
  selectedRelease: number | null = null;

  readonly isLoading = computed(() => this.sites().length === 0);
  readonly totalSpots = computed(() => this.parkingSpots().length);
  readonly unavailableSpots = computed(() =>
    this.totalSpots() > 0 ? this.parkings().length : 0
  );
  readonly availableSpots = computed(() =>
    Math.max(this.totalSpots() - this.unavailableSpots(), 0)
  );
  readonly occupancyRate = computed(() =>
    this.totalSpots() > 0
      ? Math.round((this.unavailableSpots() / this.totalSpots()) * 100)
      : 0
  );

  readonly spotInformation = computed(() => {
    const map = new Map<
      number,
      {
        parkId: number;
        custName: any;
        custMobileNo: string;
        vehicleNo: string;
        parkDate: string;
        parkSpotNo: number;
        inTime: string;
        outTime?: string;
        amount: number;
        extraCharge: number;
        floorNo: string;
        buildingName: string;
        siteName: string;
        parkingNo: string;
        clientName: string;
      }
    >();
    this.parkings().forEach((p) =>
      map.set(p.parkSpotNo, {
        parkId: p.parkId,
        custName: p.custName,
        custMobileNo: p.custMobileNo,
        vehicleNo: p.vehicleNo,
        parkDate: p.parkDate,
        parkSpotNo: p.parkSpotNo,
        inTime: p.inTime,
        outTime: p.outTime,
        amount: p.amount,
        extraCharge: p.extraCharge,
        floorNo: p.floorNo,
        buildingName: p.buildingName,
        siteName: p.siteName,
        parkingNo: p.parkingNo,
        clientName: p.clientName,
      })
    );
    return map;
  });

  readonly spotForm = this.formBuilder.nonNullable.group({
    floorId: [0],
    custName: [''],
    custMobileNo: ['', [Validators.required, Validators.minLength(3)]],
    vehicleNo: ['', [Validators.required, Validators.minLength(3)]],
    parkDate: [''],
    parkSpotNo: [0],
    inTime: [''],
    outTime: [''],
    amount: [0],
    extraCharge: [0],
    parkingNo: [''],
  });

  ngOnInit() {
    this.onLoading();
  }

  spotData(spot: number): ParkingInterface | undefined {
    return this.spotInformation().get(spot);
  }

  async onLoading() {
    try {
      const userId = Number(this.userService.isSignedUp()?.extraId);
      if (!userId) return;

      const sites = await firstValueFrom(this.clientService.getSites(userId));
      this.sites.set(sites.data || []);
    } catch {
      this.sites.set([]);
    }
  }

  async onSiteChange(site: SiteInterface | null) {
    if (!site?.siteId) {
      this.buildings.set([]);
      this.floors.set([]);
      this.parkingSpots.set([]);
      this.selectedBuilding = null;
      this.selectedFloor = null;
      return;
    }

    try {
      const buildings = await firstValueFrom(
        this.clientService.getBuilding(site.siteId)
      );
      this.buildings.set(buildings.data || []);
      this.floors.set([]);
      this.parkingSpots.set([]);
      this.selectedBuilding = null;
      this.selectedFloor = null;
    } catch {
      this.buildings.set([]);
      this.floors.set([]);
      this.parkingSpots.set([]);
    }
  }

  async onBuildingChange(building: BuildingInterface | null) {
    if (!building?.buildingId) {
      this.floors.set([]);
      this.parkingSpots.set([]);
      this.selectedFloor = null;
      return;
    }

    try {
      const floors = await firstValueFrom(
        this.clientService.getFloor(building.buildingId)
      );
      this.floors.set(floors.data || []);
      this.parkingSpots.set([]);
      this.selectedFloor = null;
    } catch {
      this.floors.set([]);
      this.parkings.set([]);
      this.parkingSpots.set([]);
    }
  }

  async onFloorChange(floor: FloorInterface | null) {
    if (!floor?.floorId) {
      this.parkingSpots.set([]);
      return;
    }

    try {
      const parking = await firstValueFrom(
        this.clientService.getParking(floor.floorId)
      );
      this.parkings.set(parking.data || []);
    } catch {
      this.parkings.set([]);
    }

    this.selectedFloor = floor.floorId;
    this.parkingSpots.set(
      Array.from({ length: floor.totalParkingSpots }, (_, i) => i + 1)
    );
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.spotForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  openReserveModal(spot: number) {
    this.selectedReserve = spot;
    this.spotForm.reset();
    this.showReserveModal.set(true);
  }

  closeReserveModal() {
    this.showReserveModal.set(false);
  }

  async onReserve() {
    if (
      this.selectedReserve === null ||
      this.spotForm.invalid ||
      this.selectedFloor === null
    )
      return;

    this.spotForm.patchValue({
      floorId: this.selectedFloor,
      parkDate: new Date().toISOString(),
      parkSpotNo: this.selectedReserve,
      inTime: new Date().toISOString(),
      outTime: new Date().toISOString(),
      parkingNo: this.selectedReserve.toString(),
    });

    const spotData: AddParkingInterface = this.spotForm.getRawValue();

    try {
      await firstValueFrom(this.clientService.addParking(spotData));
      const refreshed = await firstValueFrom(
        this.clientService.getParking(this.selectedFloor)
      );
      //I can't use update on the signal parkings because the API response on data is null :sadcrab:
      this.parkings.set(refreshed.data || []);
      this.closeReserveModal();
    } catch (err) {
      //console.log(err);
    }
  }

  openReleaseModal(spot: number) {
    this.selectedRelease = spot;
    this.spotForm.reset();
    this.showReleaseModal.set(true);
  }

  closeReleaseModal() {
    this.showReleaseModal.set(false);
  }

  async onRelease() {
    if (this.selectedRelease === null) return;

    const info = this.spotData(this.selectedRelease);
    if (!info) return;
    const parkId = info.parkId;

    try {
      await firstValueFrom(this.clientService.deleteParking(parkId));
      this.parkings.update((spots) => spots.filter((p) => p.parkId !== parkId));
      this.closeReleaseModal();
    } catch (err) {
      //console.log(err);
    }
  }
}
