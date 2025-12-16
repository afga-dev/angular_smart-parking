import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AddParking, Parking } from '../../../core/models/parking.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-dashboard-spots',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-spots.html',
  styleUrl: './dashboard-spots.css',
})
export class DashboardSpots {
  private formBuilder = inject(FormBuilder);

  private locationService = inject(LocationService);

  readonly occupiedParkings = input.required<Parking[]>();
  readonly parkingSpots = input.required<number[]>();
  readonly selectedFloor = input.required<number | null>();

  readonly reserveCompleted = output<void>();
  readonly releaseCompleted = output<void>();

  readonly showReserveModal = signal(false);
  readonly showReleaseModal = signal(false);

  selectedReserve: number | null = null;
  selectedRelease: number | null = null;

  readonly spotByNumber = computed(() => {
    return new Map(this.occupiedParkings().map((s) => [s.parkSpotNo, s]));
  });

  readonly spotForm = this.formBuilder.nonNullable.group({
    floorId: [0],
    custName: [''],
    custMobileNo: ['', [Validators.required, Validators.maxLength(17)]],
    vehicleNo: ['', [Validators.required, Validators.maxLength(15)]],
    parkDate: [''],
    parkSpotNo: [0],
    inTime: [''],
    outTime: [''],
    amount: [0],
    extraCharge: [0],
    parkingNo: [''],
  });

  hasError(controlName: string, error: string): boolean {
    const control = this.spotForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  openReserveModal(spot: number) {
    this.spotForm.reset();
    this.selectedReserve = spot;
    this.showReserveModal.set(true);
  }

  closeReserveModal() {
    this.resetSelection();
    this.showReserveModal.set(false);
  }

  async onReserve() {
    if (
      this.selectedReserve === null ||
      this.spotForm.invalid ||
      this.selectedFloor() === null
    )
      return;

    const now = new Date().toISOString();
    this.spotForm.patchValue({
      floorId: this.selectedFloor()!,
      parkDate: now,
      inTime: now,
      outTime: now,
      parkSpotNo: this.selectedReserve,
      parkingNo: String(this.selectedReserve),
    });

    const spotData: AddParking = this.spotForm.getRawValue();
    try {
      await firstValueFrom(this.locationService.addParking(spotData));

      this.closeReserveModal();
      this.reserveCompleted.emit();
    } catch (err) {
      // console.error(err);
    }
  }

  openReleaseModal(spot: number) {
    this.spotForm.reset();
    this.selectedRelease = spot;
    this.showReleaseModal.set(true);
  }

  closeReleaseModal() {
    this.resetSelection();
    this.showReleaseModal.set(false);
  }

  async onRelease() {
    if (this.selectedRelease === null) return;

    const info = this.spotByNumber().get(this.selectedRelease);
    if (!info) return;

    try {
      await firstValueFrom(this.locationService.deleteParking(info.parkId));

      this.closeReleaseModal();
      this.releaseCompleted.emit();
    } catch (err) {
      // console.error(err);
    }
  }

  private resetSelection(): void {
    this.selectedReserve = null;
    this.selectedRelease = null;
  }
}
