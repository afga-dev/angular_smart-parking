import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { SiteInterface } from '../../models/site-response.interface';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../services/user.service';
import { BuildingInterface } from '../../models/building-response.interface';
import { FloorInterface } from '../../models/floor-response.interface';
import { AddSiteInterface } from '../../models/site.interface';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class ManagementComponent implements OnInit {
  private userService = inject(UserService);
  private clientService = inject(ClientService);
  private formBuilder = inject(FormBuilder);

  readonly sites = signal<SiteInterface[]>([]);
  readonly buildings = signal<BuildingInterface[]>([]);
  readonly floors = signal<FloorInterface[]>([]);
  readonly isSubmitting = signal(false);
  readonly responseSuccessful = signal<string | null>(null);
  readonly responseError = signal<string | null>(null);
  readonly showDeleteModal = signal(false);

  newSite: boolean = false;
  newBuilding: boolean = false;
  newFloor: boolean = false;

  selectedSite: SiteInterface | null = null;
  selectedSiteForBuilding: SiteInterface | null = null;
  selectedBuilding: BuildingInterface | null = null;
  selectedBuildingForFloor: BuildingInterface | null = null;
  selectedFloor: FloorInterface | null = null;

  selectedSiteCRUD: SiteInterface | null = null;
  selectedBuildingCRUD: BuildingInterface | null = null;
  selectedFloorCRUD: FloorInterface | null = null;

  readonly isLoading = computed(() => this.sites().length === 0);

  filteredBuildings = computed(() => {
    const buildings = this.buildings();
    return (siteId: number) => [
      ...buildings.filter((b) => b.siteId === siteId),
    ];
  });

  filteredFloors = computed(() => {
    const floors = this.floors();
    return (buildingId: number) => [
      ...floors.filter((f) => f.buildingId === buildingId),
    ];
  });

  findSite = computed(() => {
    if (!this.selectedBuilding) return '';
    const site = this.sites().find(
      (s) => s.siteId === this.selectedBuilding?.siteId
    );
    return site ? site.siteName : '';
  });
  findBuilding = computed(() => {
    if (!this.selectedFloor) return '';
    const building = this.buildings().find(
      (b) => b.buildingId === this.selectedFloor?.buildingId
    );
    return building ? building.buildingName : '';
  });

  readonly siteForm = this.formBuilder.nonNullable.group({
    siteId: [0],
    clientId: [0],
    siteName: [''],
    siteCity: [''],
    siteAddress: [''],
    sitePinCode: [''],
    totalBuildings: [0],
    createdDate: [new Date()],
    getVBuildingss: this.formBuilder.array([
      this.formBuilder.nonNullable.group({
        buildingId: [0],
        siteId: [0],
        buildingName: [''],
        buildingManagerName: [''],
        contactNo: [''],
      }),
    ]),
  });

  readonly floorForm = this.formBuilder.nonNullable.group({
    floorId: [0],
    buildingId: [0],
    floorNo: ['', [Validators.required]],
    isOperational: [false],
    totalParkingSpots: [0, [Validators.required, Validators.pattern(/^\d+$/)]],
  });

  // Fetch sites, buildings, and floors from the API.
  private async fetch(extraId: number) {
    const sitesResponse = await firstValueFrom(
      this.clientService.getSites(extraId)
    );
    const sitesData = sitesResponse.data || [];

    const buildingsArray = await Promise.all(
      sitesData.map(async (site) => {
        const buildingResponse = await firstValueFrom(
          this.clientService.getBuilding(site.siteId)
        );
        return (buildingResponse.data || []).map((b) => ({ ...b }));
      })
    );
    const allBuildings = buildingsArray.flat();

    const floorsArray = await Promise.all(
      allBuildings.map(async (building) => {
        const floorsResponse = await firstValueFrom(
          this.clientService.getFloor(building.buildingId)
        );
        return (floorsResponse.data || []).map((f) => ({ ...f }));
      })
    );
    const allFloors = floorsArray.flat();

    return { sitesData, allBuildings, allFloors };
  }

  private async fetchAndSet(
    extraId: number,
    options?: {
      preserveExpanded?: boolean;
      setFirstExpanded?: boolean;
      updateSelected?: boolean;
    }
  ) {
    try {
      const { sitesData, allBuildings, allFloors } = await this.fetch(extraId);

      let processedSites;
      if (options?.preserveExpanded) {
        const currentSites = this.sites();
        processedSites = sitesData.map((newSite) => {
          const oldSite = currentSites.find((s) => s.siteId === newSite.siteId);
          return { ...newSite, expanded: oldSite?.expanded ?? false };
        });
      } else if (options?.setFirstExpanded) {
        processedSites = sitesData.map((s, i) => ({ ...s, expanded: i === 0 }));
      } else {
        processedSites = sitesData;
      }

      this.sites.set(processedSites);
      this.buildings.set(allBuildings);
      this.floors.set(allFloors);

      if (options?.updateSelected) {
        this.selectedSite =
          processedSites.find((s) => s.siteId === this.selectedSite?.siteId) ||
          null;
        this.selectedBuilding =
          allBuildings.find(
            (b) => b.buildingId === this.selectedBuilding?.buildingId
          ) || null;
        this.selectedFloor =
          allFloors.find((f) => f.floorId === this.selectedFloor?.floorId) ||
          null;
      }
    } catch {
      this.sites.set([]);
      this.buildings.set([]);
      this.floors.set([]);
    }
  }

  ngOnInit(): void {
    this.loading();
  }

  async loading() {
    const id = Number(this.userService.isSignedUp()?.extraId);
    if (!id) return;

    await this.fetchAndSet(id, { setFirstExpanded: true });
  }

  // Reset selection of site, building, or floor for update.
  private resetSelection(level: 'site' | 'building' | 'floor') {
    if (level === 'site' || level === 'building') {
      this.siteForm.reset();

      this.resetNew();
      this.resetSelected();
    }

    if (level === 'site') {
      this.resetBuildings();
      this.setSiteValidators(true);
      this.setBuildingValidators(false);

      this.selectedSite = null;
      this.selectedBuilding = null;
      this.selectedFloor = null;
    }

    if (level === 'building') {
      this.setSiteValidators(false);
      this.setBuildingValidators(true);

      this.selectedBuilding = null;
      this.selectedFloor = null;
    }

    if (level === 'floor') {
      this.floorForm.reset();
      this.resetNew();

      this.selectedFloor = null;
    }
  }

  selectSite(site: SiteInterface) {
    this.resetSelection('site');
    this.selectedSite = site;
    this.setSite(false);
  }

  selectBuilding(building: BuildingInterface) {
    this.resetSelection('building');
    this.selectedBuilding = building;
    this.setBuilding(false);
  }

  selectFloor(floor: FloorInterface) {
    this.resetSelection('floor');
    this.selectedFloor = floor;
    this.setFloor(false);
  }

  // Prepare forms for adding a new site, building, or floor.
  private resetAdd(level: 'site' | 'building' | 'floor') {
    if (level === 'site' || level === 'building') {
      this.siteForm.reset();

      this.resetNew();
      this.resetSelected();
      this.resetBuildings();
    }

    if (level === 'site') {
      this.setSiteValidators(true);
      this.setBuildingValidators(true);

      this.newSite = true;
      this.newBuilding = false;
      this.newFloor = false;

      this.selectedSiteForBuilding = null;
      this.selectedBuildingForFloor = null;
    }

    if (level === 'building') {
      this.setSiteValidators(false);
      this.setBuildingValidators(true);

      this.newBuilding = true;
      this.newFloor = false;

      this.selectedBuildingForFloor = null;
    }

    if (level === 'floor') {
      this.floorForm.reset();
      this.resetSelected();

      this.newFloor = true;
    }
  }

  addSite() {
    this.resetAdd('site');
    this.setSite(true);
  }

  addBuilding(site: SiteInterface) {
    this.resetAdd('building');
    this.selectedSiteForBuilding = site;
    this.setBuilding(true);
  }

  addFloor(building: BuildingInterface) {
    this.resetAdd('floor');
    this.selectedBuildingForFloor = building;
    this.setFloor(true);
  }

  // Add or update a site, building or floor.
  async onAddSite() {
    const site: AddSiteInterface = this.siteForm.getRawValue();

    this.resetSignals();

    try {
      let message = '';
      if (this.newSite) {
        await firstValueFrom(this.clientService.addSite(site));
        this.siteForm.reset();
        message = 'The site added successfully.';
      } else if (this.selectedSite) {
        await firstValueFrom(this.clientService.updateSite(site));
        message = 'The site updated successfully.';
      }

      this.updateSignals();
      this.responseSuccessful.set(message);
    } catch {
      this.responseError.set('An error occurred, please contact the admin.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onAddBuilding() {
    const site: AddSiteInterface = this.siteForm.getRawValue();

    this.resetSignals();

    try {
      let message = '';
      if (this.newBuilding) {
        await firstValueFrom(this.clientService.updateSite(site));
        this.siteForm.reset();
        message = 'The building added successfully.';
      } else if (this.selectedBuilding) {
        await firstValueFrom(this.clientService.updateSite(site));
        message = 'The building updated successfully.';
      }

      this.updateSignals();
      this.responseSuccessful.set(message);
    } catch {
      this.responseError.set('An error occurred, please contact the admin.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async onAddFloor() {
    const floor: FloorInterface = this.floorForm.getRawValue();

    this.resetSignals();

    try {
      let message = '';
      if (this.newFloor) {
        await firstValueFrom(this.clientService.addFloor(floor));
        this.floorForm.reset();
        message = 'The floor added successfully.';
      } else if (this.selectedFloor) {
        await firstValueFrom(this.clientService.updateFloor(floor));
        message = 'The floor updated successfully.';
      }

      this.updateSignals();
      this.responseSuccessful.set(message);
    } catch {
      this.responseError.set('An error occurred, please contact the admin.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  // Close the delete modal and clear selected items.
  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedSiteCRUD = null;
    this.selectedBuildingCRUD = null;
    this.selectedFloorCRUD = null;
  }

  // Open the modal to delete sites, buildings or floors.
  openSiteDeleteModal(site: SiteInterface) {
    this.selectedSiteCRUD = site;
    this.showDeleteModal.set(true);
  }

  openBuildingDeleteModal(building: BuildingInterface) {
    this.selectedBuildingCRUD = building;
    this.showDeleteModal.set(true);
  }

  openDeleteFloorModal(floor: FloorInterface) {
    this.selectedFloorCRUD = floor;
    this.showDeleteModal.set(true);
  }

  // Delete a site, a building or a floor.
  async onDeleteSite() {
    if (!this.selectedSiteCRUD) return;

    try {
      await firstValueFrom(
        this.clientService.deleteSite(Number(this.selectedSiteCRUD.siteId))
      );

      this.updateSignals();
      this.closeDeleteModal();
    } catch (err) {
      //console.log(err);
    }
  }

  async onDeleteBuilding() {
    if (!this.selectedBuildingCRUD) return;

    try {
      // Delete button is disabled as there is no API endpoint for buildings; code retained for potential future use.
      // await firstValueFrom(
      //   this.clientService.deleteBuilding(Number(this.selectedBuildingCRUD.buildingId))
      // );
      // this.updateSignals();
      // this.closeDeleteModal();
    } catch (err) {
      // console.log(err);
    }
  }

  async onDeleteFloor() {
    if (!this.selectedFloorCRUD) return;

    try {
      await firstValueFrom(
        this.clientService.deleteFloor(this.selectedFloorCRUD.floorId)
      );

      this.updateSignals();
      this.closeDeleteModal();
    } catch (err) {
      // console.log(err);
    }
  }

  // Cancel changes and reset forms for site, building, or floor.
  onCancel() {
    if (this.newSite || this.newBuilding) {
      this.siteForm.reset();
    } else if (this.newFloor) {
      this.floorForm.reset();
    }

    if (this.selectedSite) {
      this.setSite(false);
    } else if (this.selectedBuilding) {
      this.setBuilding(false);
    } else if (this.selectedFloor) {
      this.setFloor(false);
    }
  }

  // Toggle expansion state of a site.
  toggleSite(site: SiteInterface) {
    site.expanded = !site.expanded;
    this.sites.update((s) => [...s]);
  }

  // Update the sites, buildings and floors signals.
  async updateSignals() {
    const id = Number(this.userService.isSignedUp()?.extraId);
    if (!id) return;

    await this.fetchAndSet(id, {
      preserveExpanded: true,
      updateSelected: true,
    });
  }

  // Check if a form control has a specific validation error.
  hasError(controlName: string, error: string): boolean {
    const control =
      this.siteForm.get(controlName) ?? this.floorForm.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  hasErrorInArray(group: FormGroup, controlName: string, error: string) {
    const control = group.get(controlName);
    return !!(control?.touched && control?.hasError(error));
  }

  buildingGroup(i: number): FormGroup {
    return this.getVBuildingss.at(i) as FormGroup;
  }

  // Reset the selected or new actions on sites, buildings and floors.
  resetSelected() {
    this.selectedSite = null;
    this.selectedBuilding = null;
    this.selectedFloor = null;
  }

  resetNew() {
    this.newSite = false;
    this.newBuilding = false;
    this.newFloor = false;
  }

  resetSignals() {
    this.isSubmitting.set(true);
    this.responseSuccessful.set(null);
    this.responseError.set(null);
  }

  // Helper to build FormGroup for a building.
  private buildSiteFormGroup(building: BuildingInterface): FormGroup {
    return this.formBuilder.nonNullable.group({
      buildingId: [building.buildingId],
      siteId: [building.siteId],
      buildingName: [building.buildingName],
      buildingManagerName: [building.buildingManagerName],
      contactNo: [building.contactNo],
    });
  }

  getBuildings() {
    if (!this.selectSite) return;

    const selectedSiteId = this.selectedSite?.siteId;
    const filteredBuildings = this.buildings().filter(
      (b) => b.siteId === selectedSiteId
    );

    const buildingArray = this.formBuilder.array(
      filteredBuildings.map((b) => this.buildSiteFormGroup(b))
    );

    this.siteForm.setControl('getVBuildingss', buildingArray);
  }

  resetBuildings() {
    const buildingArray = this.formBuilder.array([
      this.formBuilder.nonNullable.group({
        buildingId: [0],
        siteId: [0],
        buildingName: [''],
        buildingManagerName: [''],
        contactNo: [''],
      }),
    ]);

    this.siteForm.setControl('getVBuildingss', buildingArray);
  }

  // Forms for the sites, building and floors for adding or updating.
  setSite(isNew: boolean) {
    if (isNew) {
      if (!this.newSite) return;
      this.siteForm.patchValue({
        clientId: this.userService.isSignedUp()?.extraId,
      });
    } else {
      if (!this.selectedSite) return;
      this.siteForm.patchValue({
        siteId: this.selectedSite.siteId,
        clientId: this.selectedSite.clientId,
        siteName: this.selectedSite.siteName,
        siteCity: this.selectedSite.siteCity,
        siteAddress: this.selectedSite.siteAddress,
        sitePinCode: this.selectedSite.sitePinCode,
        totalBuildings: this.selectedSite.totalBuildings,
        createdDate: new Date(this.selectedSite.createdDate),
      });

      this.getBuildings();
    }
  }

  setBuilding(isNew: boolean) {
    if (!this.selectedBuilding && !this.selectedSiteForBuilding) return;
    const selectedSiteId =
      this.selectedBuilding?.siteId ?? this.selectedSiteForBuilding?.siteId;
    const filteredSites = this.sites().find((s) => s.siteId === selectedSiteId);

    if (!filteredSites) return;
    this.siteForm.patchValue({
      siteId: filteredSites.siteId,
      clientId: filteredSites.clientId,
      siteName: filteredSites.siteName,
      siteCity: filteredSites.siteCity,
      siteAddress: filteredSites.siteAddress,
      sitePinCode: filteredSites.sitePinCode,
      totalBuildings: filteredSites.totalBuildings,
      createdDate: new Date(filteredSites.createdDate),
    });

    if (!isNew) {
      const buildingArray = this.formBuilder.array([
        this.buildSiteFormGroup(this.selectedBuilding!),
      ]);

      this.siteForm.setControl('getVBuildingss', buildingArray);
    }
  }

  setFloor(isNew: boolean) {
    if (isNew) {
      if (!this.newFloor) return;
      this.floorForm.patchValue({
        buildingId: this.selectedBuildingForFloor?.buildingId,
      });
    } else {
      if (!this.selectedFloor) return;
      this.floorForm.patchValue({
        floorId: this.selectedFloor.floorId,
        buildingId: this.selectedFloor.buildingId,
        floorNo: this.selectedFloor.floorNo,
        totalParkingSpots: this.selectedFloor.totalParkingSpots,
      });
    }
  }

  // Access to VBuildingss from UI.
  get getVBuildingss(): FormArray {
    return this.siteForm.get('getVBuildingss') as FormArray;
  }

  // Validators.
  setSiteValidators(isSite: boolean) {
    const controls = ['siteName', 'siteCity', 'siteAddress', 'sitePinCode'];

    controls.forEach((field) => {
      const control = this.siteForm.get(field);
      if (!control) return;

      if (isSite) {
        control.addValidators(Validators.required);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    });
  }

  setBuildingValidators(isNew: boolean) {
    const buildingGroups = this.getVBuildingss.controls as FormGroup[];

    buildingGroups.forEach((group) => {
      const buildingName = group.get('buildingName');
      const managerName = group.get('buildingManagerName');
      const contactNo = group.get('contactNo');

      if (isNew) {
        buildingName?.setValidators([Validators.required]);
        managerName?.setValidators([Validators.required]);
        contactNo?.setValidators([Validators.required]);
      } else {
        buildingName?.clearValidators();
        managerName?.clearValidators();
        contactNo?.clearValidators();
      }

      buildingName?.updateValueAndValidity();
      managerName?.updateValueAndValidity();
      contactNo?.updateValueAndValidity();
    });
  }

  // Returns true if a site has floors; used to disable delete button for sites.
  hasFloors(site: SiteInterface): boolean {
    const siteBuildings = this.buildings().filter(
      (b) => b.siteId === site.siteId
    );

    return siteBuildings.some((b) =>
      this.floors().some((f) => f.buildingId === b.buildingId)
    );
  }
}
