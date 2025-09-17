import { checkIn, checkOut, getAvailableSpots, createParkingSpot } from '../../src/controllers/parkingController';
import mongoose from 'mongoose';

// Mock models with proper Mongoose query chaining
jest.mock('../../src/models/Vehicle', () => {
  const mockVehicle = {
    _id: 'vehicleId',
    licensePlate: 'ABC123',
    size: 'car',
    save: jest.fn().mockResolvedValue({
      _id: 'vehicleId',
      licensePlate: 'ABC123',
      size: 'car'
    })
  };

  const findOneQuery = {
    session: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    then: jest.fn().mockImplementation(function (this: { exec: jest.Mock }, resolve) {
      return this.exec().then(resolve);
    })
  };

  const mockModel = jest.fn().mockImplementation((data: any) => ({
    _id: 'vehicleId',
    licensePlate: 'ABC123',
    size: 'car',
    ...data,
    save: jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve(this);
    })
  })) as any;

  mockModel.findOne = jest.fn().mockReturnValue(findOneQuery);
  mockModel.create = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      _id: 'vehicleId',
      licensePlate: 'ABC123',
      size: 'car',
      ...data
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });

  // Expose query objects for testing
  mockModel.mockFindOneQuery = findOneQuery;

  return mockModel;
});

jest.mock('../../src/models/Transaction', () => {
  const mockModel = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      _id: 'transactionId',
      vehicle: 'vehicleId',
      spot: 'spotId',
      vehicleSize: 'car',
      entryTime: new Date(),
      exitTime: null,
      status: 'active',
      totalFee: 0,
      ...data
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  }) as any;

  const findOneQuery = {
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    then: jest.fn().mockImplementation(function (this: { exec: jest.Mock }, resolve) {
      return this.exec().then(resolve);
    })
  };

  mockModel.findOne = jest.fn().mockReturnValue(findOneQuery);
  mockModel.create = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      _id: 'transactionId',
      vehicle: 'vehicleId',
      spot: 'spotId',
      vehicleSize: 'car',
      entryTime: new Date(),
      exitTime: null,
      status: 'active',
      totalFee: 0,
      ...data
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });

  // Expose query objects for testing
  mockModel.mockFindOneQuery = findOneQuery;

  return mockModel;
});

jest.mock('../../src/models/ParkingSpot', () => {
  const mockModel = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      _id: 'spotId',
      floor: 1,
      spotNumber: 5,
      size: 'car',
      isAvailable: false,
      ...data
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  }) as any;

  const findQuery = {
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    then: jest.fn().mockImplementation(function (this: { exec: jest.Mock }, resolve) {
      return this.exec().then(resolve);
    })
  };

  mockModel.find = jest.fn().mockReturnValue(findQuery);
  mockModel.findByIdAndUpdate = jest.fn();
  mockModel.create = jest.fn().mockImplementation((data: any) => {
    const instance: any = {
      _id: 'spotId',
      floor: 1,
      spotNumber: 5,
      size: 'car',
      isAvailable: false,
      ...data
    };
    instance.save = jest.fn().mockResolvedValue(instance);
    return instance;
  });
  
  // Expose query objects for testing
  mockModel.mockFindQuery = findQuery;

  return mockModel;
});

// Mock service
jest.mock('../../src/services/spotAllocationService', () => ({
  allocateSpot: jest.fn()
}));

// Mock mongoose session
jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  startSession: jest.fn().mockReturnValue({
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
    withTransaction: jest.fn()
  })
}));

// Get mocked implementations
const Vehicle = require('../../src/models/Vehicle');
const Transaction = require('../../src/models/Transaction');
const ParkingSpot = require('../../src/models/ParkingSpot');
const { allocateSpot } = require('../../src/services/spotAllocationService');

describe('Parking Controller Tests', () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('checkIn', () => {
    it('should check in a new vehicle successfully', async () => {
      req.body = { licensePlate: 'ABC123', vehicleSize: 'car' };
      
      // Mock vehicle not found
      Vehicle.mockFindOneQuery.exec.mockResolvedValue(null);
      // Mock spot allocation
      allocateSpot.mockResolvedValue({
        _id: 'spotId',
        floor: 1,
        spotNumber: 5,
        size: 'car',
        isAvailable: false
      });

      await checkIn(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Vehicle checked in successfully',
        spot: {
          floor: 1,
          spotNumber: 5,
          size: 'car'
        }
      });
    });

    it('should return 400 for vehicle size mismatch', async () => {
      req.body = { licensePlate: 'ABC123', vehicleSize: 'car' };
      
      // Mock existing vehicle with different size
      Vehicle.mockFindOneQuery.exec.mockResolvedValue({
        _id: 'vehicleId',
        licensePlate: 'ABC123',
        size: 'motorcycle',
        save: jest.fn().mockResolvedValue({
          _id: 'vehicleId',
          licensePlate: 'ABC123',
          size: 'motorcycle'
        })
      });

      await checkIn(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Vehicle size mismatch'
      });
    });
  });

  describe('getAvailableSpots', () => {
    it('should return available spots', async () => {
      const mockSpots = [
        { floor: 1, spotNumber: 1, size: 'small', isAvailable: true }
      ];
      
      ParkingSpot.mockFindQuery.exec.mockResolvedValue(mockSpots);

      await getAvailableSpots(req, res);

      expect(ParkingSpot.find).toHaveBeenCalledWith({ isAvailable: true });
      expect(res.json).toHaveBeenCalledWith({
        message: 'Available parking spots retrieved successfully',
        count: 1,
        spots: mockSpots
      });
    });
  });

  describe('createParkingSpot', () => {
    it('should create a new parking spot', async () => {
      req.body = { floor: 1, spotNumber: 1, size: 'small' };
      
      // Mock the instance created by new ParkingSpot
      ParkingSpot.mockImplementation((data: any) => ({
        ...data,
        save: jest.fn().mockResolvedValue({
          _id: 'spotId',
          floor: 1,
          spotNumber: 1,
          size: 'small',
          isAvailable: true
        })
      }));

      await createParkingSpot(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Parking spot created successfully',
        spot: {
          floor: 1,
          spotNumber: 1,
          size: 'small',
          isAvailable: true
        }
      });
    });
  });
});
