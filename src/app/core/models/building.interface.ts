export interface BuildingResponse {
  message: string;
  result: boolean;
  data: Building[];
}
export interface Building {
  buildingId: number;
  siteId: number;
  buildingName: string;
  buildingManagerName: string;
  contactNo: string;
  siteName: string;
}
