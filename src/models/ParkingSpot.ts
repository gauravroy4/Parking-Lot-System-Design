import type { Document, Model } from 'mongoose';
import type { VehicleSize } from '../config/vehicleConfig';
const { Schema, model } = require('mongoose');
const { vehicleConfig } = require('../config/vehicleConfig');

export interface IParkingSpot extends Document {
  floor: number;
  spotNumber: number;
  size: VehicleSize;
  isAvailable: boolean;
}

const ParkingSpotSchema = new Schema({
  floor: { type: Number, required: true },
  spotNumber: { type: Number, required: true },
  size: { type: String, enum: Object.keys(vehicleConfig), required: true },
  isAvailable: { type: Boolean, default: true }
});

module.exports = model('ParkingSpot', ParkingSpotSchema) as Model<IParkingSpot>;
