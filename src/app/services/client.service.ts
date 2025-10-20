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
      `${this.baseUrl}/getallsites?clientid=${id}`
    );
  }

  getBuilding(id: number): Observable<BuildingResponseInterface> {
    return this.httpClient.get<BuildingResponseInterface>(
      `${this.baseUrl}/getbuildingbysiteid?id=${id}`
    );
  }

  getFloor(id: number): Observable<FloorResponseInterface> {
    return this.httpClient.get<FloorResponseInterface>(
      `${this.baseUrl}/getfloorsbybuildingid?id=${id}`
    );
  }

  getParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.get<ParkingResponseInterface>(
      `${this.baseUrl}/getallparkingbyfloor?id=${id}`
    );
  }

  getAllParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.get<ParkingResponseInterface>(
      `${this.baseUrl}/getallparkingbyclientid?id=${id}`
    );
  }

  addParking(
    parking: AddParkingInterface
  ): Observable<ParkingResponseInterface> {
    return this.httpClient.post<ParkingResponseInterface>(
      `${this.baseUrl}/addparking`,
      parking
    );
  }

  deleteParking(id: number): Observable<ParkingResponseInterface> {
    return this.httpClient.post<ParkingResponseInterface>(
      `${this.baseUrl}/deleteparking?id=${id}`,
      null
    );
  }

  addSite(site: AddSiteInterface): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/addclientsite`,
      site
    );
  }

  updateSite(site: AddSiteInterface): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/updatesite`,
      site
    );
  }

  deleteSite(id: number): Observable<SiteResponseInterface> {
    return this.httpClient.post<SiteResponseInterface>(
      `${this.baseUrl}/deletesite?id=${id}`,
      null
    );
  }

  addFloor(floor: FloorInterface): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/addfloor`,
      floor
    );
  }

  updateFloor(floor: FloorInterface): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/updatefloor`,
      floor
    );
  }

  deleteFloor(id: number): Observable<FloorResponseInterface> {
    return this.httpClient.post<FloorResponseInterface>(
      `${this.baseUrl}/deletefloor?id=${id}`,
      null
    );
  }
}
