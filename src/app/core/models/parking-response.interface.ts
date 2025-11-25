export interface ParkingResponseInterface {
    message: string;
    result: boolean;
    data: ParkingInterface[]
}
export interface ParkingInterface {
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
