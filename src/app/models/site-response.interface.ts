export interface SiteResponseInterface {
    message: string;
    result: boolean;
    data: SiteInterface[]
}
export interface SiteInterface {
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
