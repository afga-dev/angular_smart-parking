export interface FloorResponseInterface {
    message: string;
    result: boolean;
    data: FloorInterface[];
}
export interface FloorInterface {
    floorId: number;
    buildingId: number;
    floorNo: string;
    isOperational: boolean;
    totalParkingSpots: number;
}
