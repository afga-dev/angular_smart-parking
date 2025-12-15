export interface SiteResponse {
  message: string;
  result: boolean;
  data: Site[];
}
export interface Site {
  siteId: number;
  clientId: number;
  clientName: string;
  siteName: string;
  siteCity: string;
  siteAddress: string;
  sitePinCode: string;
  totalBuildings: number;
  createdDate: string;
  expanded?: boolean;
}
export interface AddSite {
  siteId: number;
  clientId: number;
  siteName: string;
  siteCity: string;
  siteAddress: string;
  sitePinCode: string;
  totalBuildings: number;
  createdDate: Date;
  getVBuildingss: AddBuilding[];
}
export interface AddBuilding {
  buildingId: number;
  siteId: number;
  buildingName: string;
  buildingManagerName: string;
  contactNo: string;
}
