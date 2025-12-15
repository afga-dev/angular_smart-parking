export interface FloorResponse {
  message: string;
  result: boolean;
  data: Floor[];
}
export interface Floor {
  floorId: number;
  buildingId: number;
  floorNo: string;
  isOperational: boolean;
  totalParkingSpots: number;
}
