import request from 'supertest';
import app from '../../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('Concurrency Tests', () => {
  let mongoServer: MongoMemoryServer;
  let connection: any;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Load models with temporary connection
    require('../../src/models/ParkingSpot');
    require('../../src/models/Vehicle');
    require('../../src/models/Transaction');
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
  });

  it('should handle concurrent check-ins correctly', async () => {
    const vehicles = [
      { licensePlate: 'ABC123', vehicleSize: 'car' },
      { licensePlate: 'XYZ789', vehicleSize: 'car' }
    ];

    // Create spots first
    await request(app)
      .post('/api/parking-spots')
      .send({ floor: 1, spotNumber: 1, size: 'car' });

    await request(app)
      .post('/api/parking-spots')
      .send({ floor: 1, spotNumber: 2, size: 'car' });

    // Run check-ins concurrently
    const responses = await Promise.all(
      vehicles.map(vehicle => 
        request(app)
          .post('/api/check-in')
          .send(vehicle)
      )
    );

    // Verify both check-ins succeeded with different spots
    expect(responses[0].status).toBe(201);
    expect(responses[1].status).toBe(201);
    expect(responses[0].body.spot.spotNumber).not.toBe(
      responses[1].body.spot.spotNumber
    );
  });

  it('should prevent double booking of same spot', async () => {
    // Create a single spot
    await request(app)
      .post('/api/parking-spots')
      .send({ floor: 1, spotNumber: 1, size: 'car' });

    // Try to check in twice concurrently
    const [response1, response2] = await Promise.all([
      request(app)
        .post('/api/check-in')
        .send({ licensePlate: 'ABC123', vehicleSize: 'car' }),
        
      request(app)
        .post('/api/check-in')
        .send({ licensePlate: 'XYZ789', vehicleSize: 'car' })
    ]);

    // One should succeed, one should fail
    expect([response1.status, response2.status].sort()).toEqual([201, 400]);
  });
});
