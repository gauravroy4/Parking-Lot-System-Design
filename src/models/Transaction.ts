import type { Document, Model, Types } from 'mongoose';
import type { VehicleSize } from '../config/vehicleConfig';
const { Schema, model } = require('mongoose');
const { vehicleConfig } = require('../config/vehicleConfig');

export interface ITransaction extends Document {
  vehicle: Types.ObjectId;
  spot: Types.ObjectId;
  vehicleSize: VehicleSize;
  entryTime: Date;
  exitTime?: Date;
  totalFee?: number;
  status: 'active' | 'completed';
}

const TransactionSchema = new Schema({
  vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  spot: { type: Schema.Types.ObjectId, ref: 'ParkingSpot', required: true },
  vehicleSize: { type: String, enum: Object.keys(vehicleConfig), required: true },
  entryTime: { type: Date, required: true },
  exitTime: { type: Date },
  totalFee: { type: Number },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
});

module.exports = model('Transaction', TransactionSchema) as Model<ITransaction>;
