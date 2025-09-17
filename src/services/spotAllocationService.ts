import type { IParkingSpot } from '../models/ParkingSpot';
import type { Model } from 'mongoose';
import { vehicleConfig, VehicleSize } from '../config/vehicleConfig';
const ParkingSpot = require('../models/ParkingSpot') as Model<IParkingSpot>;

export const allocateSpot = async (vehicleSize: VehicleSize, session?: any) => {
  // Get acceptable spot sizes from configuration
  const config = vehicleConfig[vehicleSize];
  if (!config) {
    throw new Error(`Invalid vehicle size: ${vehicleSize}`);
  }

  // Find and update the first available spot atomically
  const spot = await ParkingSpot.findOneAndUpdate(
    {
      size: { $in: config.acceptableSizes },
      isAvailable: true
    },
    { $set: { isAvailable: false } },
    {
      sort: { floor: 1, spotNumber: 1 },
      new: true,
      session
    }
  );

  return spot;
};
