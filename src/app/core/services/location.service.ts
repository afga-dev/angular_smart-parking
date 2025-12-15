import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BuildingResponse } from '../models/building.interface';
import { AddParking, ParkingResponse } from '../models/parking.interface';
import { API_URL } from './api.token';
import { AddSite, SiteResponse } from '../models/site.interface';
import { Floor, FloorResponse } from '../models/floor.interface';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private httpClient = inject(HttpClient);
  private baseUrl = inject(API_URL);

  getSites(id: number): Observable<SiteResponse> {
    return this.httpClient.get<SiteResponse>(
      `${this.baseUrl}/getallsites?clientid=${id}`
    );
  }

  getBuildings(id: number): Observable<BuildingResponse> {
    return this.httpClient.get<BuildingResponse>(
      `${this.baseUrl}/getbuildingbysiteid?id=${id}`
    );
  }

  getFloors(id: number): Observable<FloorResponse> {
    return this.httpClient.get<FloorResponse>(
      `${this.baseUrl}/getfloorsbybuildingid?id=${id}`
    );
  }

  getParkings(id: number): Observable<ParkingResponse> {
    return this.httpClient.get<ParkingResponse>(
      `${this.baseUrl}/getallparkingbyfloor?id=${id}`
    );
  }

  getAllParkings(id: number): Observable<ParkingResponse> {
    return this.httpClient.get<ParkingResponse>(
      `${this.baseUrl}/getallparkingbyclientid?id=${id}`
    );
  }

  addParking(parking: AddParking): Observable<ParkingResponse> {
    return this.httpClient.post<ParkingResponse>(
      `${this.baseUrl}/addparking`,
      parking
    );
  }

  deleteParking(id: number): Observable<ParkingResponse> {
    return this.httpClient.post<ParkingResponse>(
      `${this.baseUrl}/deleteparking?id=${id}`,
      null
    );
  }

  addSite(site: AddSite): Observable<SiteResponse> {
    return this.httpClient.post<SiteResponse>(
      `${this.baseUrl}/addclientsite`,
      site
    );
  }

  updateSite(site: AddSite): Observable<SiteResponse> {
    return this.httpClient.post<SiteResponse>(
      `${this.baseUrl}/updatesite`,
      site
    );
  }

  deleteSite(id: number): Observable<SiteResponse> {
    return this.httpClient.post<SiteResponse>(
      `${this.baseUrl}/deletesite?id=${id}`,
      null
    );
  }

  addFloor(floor: Floor): Observable<FloorResponse> {
    return this.httpClient.post<FloorResponse>(
      `${this.baseUrl}/addfloor`,
      floor
    );
  }

  updateFloor(floor: Floor): Observable<FloorResponse> {
    return this.httpClient.post<FloorResponse>(
      `${this.baseUrl}/updatefloor`,
      floor
    );
  }

  deleteFloor(id: number): Observable<FloorResponse> {
    return this.httpClient.post<FloorResponse>(
      `${this.baseUrl}/deletefloor?id=${id}`,
      null
    );
  }
}
