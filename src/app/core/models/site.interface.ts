export interface AddSiteInterface {
    siteId: number;
    clientId: number;
    siteName: string;
    siteCity: string;
    siteAddress: string;
    sitePinCode: string;
    totalBuildings: number;
    createdDate: Date;
    getVBuildingss: addBuildingInterface[];
}
export interface addBuildingInterface {
    buildingId: number;
    siteId: number;
    buildingName: string;
    buildingManagerName: string;
    contactNo: string;
}
