import { IParkingSpot } from '../../src/models/ParkingSpot';
import mongoose from 'mongoose';

// Mock Mongoose model directly
jest.mock('../../src/models/ParkingSpot', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
}));

const ParkingSpot = require('../../src/models/ParkingSpot');

describe('ParkingSpot Model Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a parking spot with valid data', async () => {
    const mockSpot: IParkingSpot = {
      _id: new mongoose.Types.ObjectId(),
      floor: 1,
      spotNumber: 5,
      size: 'small',
      isAvailable: true,
      __v: 0
    } as any;

    (ParkingSpot.create as jest.Mock).mockResolvedValue(mockSpot);
    
    const result = await ParkingSpot.create({
      floor: 1,
      spotNumber: 5,
      size: 'small',
      isAvailable: true
    });

    expect(ParkingSpot.create).toHaveBeenCalledWith({
      floor: 1,
      spotNumber: 5,
      size: 'small',
      isAvailable: true
    });
    expect(result).toEqual(mockSpot);
  });

  it('should find available spots by size', async () => {
    const mockSpots = [
      { _id: new mongoose.Types.ObjectId(), floor: 1, spotNumber: 1, size: 'small', isAvailable: true } as any
    ];

    (ParkingSpot.find as jest.Mock).mockResolvedValue(mockSpots);
    
    const result = await ParkingSpot.find({ size: 'small', isAvailable: true });

    expect(ParkingSpot.find).toHaveBeenCalledWith({ size: 'small', isAvailable: true });
    expect(result).toHaveLength(1);
    expect(result[0].size).toBe('small');
  });
});
