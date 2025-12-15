export interface ParkingResponse {
  message: string;
  result: boolean;
  data: Parking[];
}
export interface Parking {
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
export interface AddParking {
  floorId: number;
  custName: string;
  custMobileNo: string;
  vehicleNo: string;
  parkDate: string;
  parkSpotNo: number;
  inTime: string;
  outTime: string;
  amount: number;
  extraCharge: number;
  parkingNo: string;
}
