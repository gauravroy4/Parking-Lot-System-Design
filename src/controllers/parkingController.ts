import type { Request, Response } from 'express';
import type { IVehicle } from '../models/Vehicle';
import type { ITransaction } from '../models/Transaction';
import type { IParkingSpot } from '../models/ParkingSpot';
import type { Model } from 'mongoose';
const Vehicle = require('../models/Vehicle') as Model<IVehicle>;
const Transaction = require('../models/Transaction') as Model<ITransaction>;
const ParkingSpot = require('../models/ParkingSpot') as Model<IParkingSpot>;
const { allocateSpot } = require('../services/spotAllocationService');
const mongoose = require('mongoose');

export const checkIn = async (req: Request, res: Response) => {
  const { licensePlate, vehicleSize } = req.body;

  if (!licensePlate || !vehicleSize) {
    return res.status(400).json({ error: 'License plate and vehicle size are required' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find or create vehicle
    let vehicle = await Vehicle.findOne({ licensePlate }).session(session);
    if (!vehicle) {
      vehicle = new Vehicle({ licensePlate, size: vehicleSize });
      await vehicle.save({ session });
    } else if (vehicle.size !== vehicleSize) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Vehicle size mismatch' });
    }

    // Allocate parking spot
    const spot = await allocateSpot(vehicleSize, session);
    if (!spot) {
      await session.abortTransaction();
      return res.status(400).json({ error: 'No parking spots available' });
    }

    // Create transaction
    const transaction = new Transaction({
      vehicle: vehicle._id,
      spot: spot._id,
      vehicleSize: vehicleSize,
      entryTime: new Date(),
      status: 'active'
    });

    await transaction.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: 'Vehicle checked in successfully',
      spot: {
        floor: spot.floor,
        spotNumber: spot.spotNumber,
        size: spot.size
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    session.endSession();
  }
};

export const checkOut = async (req: Request, res: Response) => {
  const { licensePlate } = req.body;

  if (!licensePlate) {
    return res.status(400).json({ error: 'License plate is required' });
  }

  // Find vehicle
  const vehicle = await Vehicle.findOne({ licensePlate });
  if (!vehicle) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  // Find active transaction
  const transaction = await Transaction.findOne({
    vehicle: vehicle._id,
    status: 'active'
  }).populate('spot');

  if (!transaction) {
    return res.status(404).json({ error: 'Active transaction not found' });
  }

  // Update transaction
  transaction.exitTime = new Date();
  transaction.status = 'completed';

  // Calculate fee
  const durationMs = transaction.exitTime.getTime() - transaction.entryTime.getTime();
  const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
  
  let fee = 0;
  switch (transaction.vehicleSize) {
    case 'motorcycle':
      fee = durationHours * 10;
      break;
    case 'car':
      fee = durationHours * 20;
      break;
    case 'bus':
      fee = durationHours * 30;
      break;
  }
  
  transaction.totalFee = fee;
  await transaction.save();

  // Release parking spot
  await ParkingSpot.findByIdAndUpdate(transaction.spot._id, { isAvailable: true });

  res.json({
    message: 'Vehicle checked out successfully',
    fee: fee,
    durationHours: durationHours,
    exitTime: transaction.exitTime
  });
};

export const getAvailableSpots = async (req: Request, res: Response) => {
  try {
    const availableSpots = await ParkingSpot.find({ isAvailable: true })
      .sort({ floor: 1, spotNumber: 1 });

    res.json({
      message: 'Available parking spots retrieved successfully',
      count: availableSpots.length,
      spots: availableSpots.map(spot => ({
        floor: spot.floor,
        spotNumber: spot.spotNumber,
        size: spot.size,
        isAvailable: spot.isAvailable
      }))
    });
  } catch (error) {
    console.error('Error retrieving available spots:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createParkingSpot = async (req: Request, res: Response) => {
  const { floor, spotNumber, size } = req.body;

  if (!floor || !spotNumber || !size) {
    return res.status(400).json({ error: 'Floor, spotNumber, and size are required' });
  }

  try {
    const newSpot = new ParkingSpot({
      floor,
      spotNumber,
      size,
      isAvailable: true
    });

    await newSpot.save();

    res.status(201).json({
      message: 'Parking spot created successfully',
      spot: {
        floor: newSpot.floor,
        spotNumber: newSpot.spotNumber,
        size: newSpot.size,
        isAvailable: newSpot.isAvailable
      }
    });
  } catch (error) {
    console.error('Error creating parking spot:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
