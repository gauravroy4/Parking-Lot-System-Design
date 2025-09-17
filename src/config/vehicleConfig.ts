export const vehicleConfig = {
  motorcycle: { 
    acceptableSizes: ['motorcycle', 'car', 'bus'] as const, 
    feeRate: 10 
  },
  car: { 
    acceptableSizes: ['car', 'bus'] as const, 
    feeRate: 20 
  },
  bus: { 
    acceptableSizes: ['bus'] as const, 
    feeRate: 30 
  }
};

export type VehicleSize = keyof typeof vehicleConfig;
