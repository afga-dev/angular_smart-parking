export interface ConfigurationInterface {
    form?: 'siteForm' | 'floorForm';
    resetBuildings?: boolean;
    siteValidators?: boolean;
    buildingValidators?: boolean;
    resetSelectedFlags?: boolean;
    resetNewFlags?: boolean;
}
