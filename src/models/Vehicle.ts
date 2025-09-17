import type { Document, Model } from 'mongoose';
import type { VehicleSize } from '../config/vehicleConfig';
const { Schema, model } = require('mongoose');
const { vehicleConfig } = require('../config/vehicleConfig');

export interface IVehicle extends Document {
  licensePlate: string;
  size: VehicleSize;
}

const VehicleSchema = new Schema({
  licensePlate: { 
    type: String, 
    required: true,
    unique: true,
    trim: true
  },
  size: { 
    type: String, 
    enum: Object.keys(vehicleConfig), 
    required: true 
  }
});

module.exports = model('Vehicle', VehicleSchema) as Model<IVehicle>;
