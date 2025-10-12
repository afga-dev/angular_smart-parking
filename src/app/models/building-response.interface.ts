export interface BuildingResponseInterface {
    message: string;
    result: boolean;
    data: BuildingInterface[];
}
export interface BuildingInterface {
    buildingId: number;
    siteId: number;
    buildingName: string;
    buildingManagerName: string;
    contactNo: string;
    siteName: string;
}
