export interface Filters {
    location?: string;
    fetchAll?: boolean;
    sizeRange?: [number, number];
    budgetRange?: [number, number];
    storageType?: string;
    [key: string]: string | boolean | [number, number] | undefined; 
  }
  