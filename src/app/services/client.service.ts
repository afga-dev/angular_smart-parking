import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SiteResponseInterface } from '../models/site-response.interface';
import { API_URL } from '../app.config';
import { BuildingResponseInterface } from '../models/building-response.interface';
import {
  FloorInterface,
  FloorResponseInterface,
} from '../models/floor-response.interface';
import { ParkingResponseInterface } from '../models/parking-response.interface';
import { AddParkingInterface } from '../models/parking.interface';
import { AddSiteInterface } from '../models/site.interface';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private httpClient = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getSites(id: number): Observable<SiteResponseInterface> {
    return this.httpClient.get<SiteResponseInterface>(
      `${this.baseUrl}/GetAllSites?clientid=${id}`
    );
  }

  getBuilding(id: number): Observable<BuildingResponseInterface> {
    return this.httpClient.get<BuildingResponseInterface>(
      `${this.baseUrl}/GetBuildingBySiteId?id=${id}`
    );
  }

  getFloor(id: number): Observable<FloorResponseInterface> {
    return this.httpClient.get<FloorResponseInterface>(
      `${this.baseUrl}/GetFloorsByBuildingId?id=${id}`
    );
  }

  getParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.get<ParkingResponseInterface>(
      `${this.baseUrl}/GetAllParkingByFloor?id=${id}`
    );
  }

  getAllParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.get<ParkingResponseInterface>(
      `${this.baseUrl}/GetAllParkingByClientId?id=${id}`
    );
  }

  addParking(
    parking: AddParkingInterface
  ): Observable<ParkingResponseInterface> {
    return this.httpClient.post<ParkingResponseInterface>(
      `${this.baseUrl}/AddParking`,
      parking
    );
  }

  deleteParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.post<ParkingResponseInterface>(
      `${this.baseUrl}/DeleteParking?id=${id}`,
      null
    );
  }

  addSite(site: AddSiteInterface): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/addClientSite`,
      site
    );
  }

  updateSite(site: AddSiteInterface): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/updateSite`,
      site
    );
  }

  deleteSite(id: number): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/DeleteSite?id=${id}`,
      null
    );
  }

  addFloor(floor: FloorInterface): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/AddFloor`,
      floor
    );
  }

  updateFloor(floor: FloorInterface): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/UpdateFloor`,
      floor
    );
  }

  deleteFloor(id: number): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/DeleteFloor?id=${id}`,
      null
    );
  }
}
