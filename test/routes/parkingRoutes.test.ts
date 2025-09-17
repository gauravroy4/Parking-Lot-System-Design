import { checkIn, checkOut, getAvailableSpots, createParkingSpot } from '../../src/controllers/parkingController';
jest.mock('../../src/controllers/parkingController');

const router: any = require('../../src/routes/parkingRoutes');

describe('Parking Routes', () => {
  it('should map POST /check-in to checkIn controller', () => {
    const route = router.stack.find((layer: any) => 
      layer.route && layer.route.path === '/check-in' && layer.route.methods.post
    );
    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(checkIn);
  });

  it('should map POST /check-out to checkOut controller', () => {
    const route = router.stack.find((layer: any) => 
      layer.route && layer.route.path === '/check-out' && layer.route.methods.post
    );
    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(checkOut);
  });

  it('should map GET /available-spots to getAvailableSpots controller', () => {
    const route = router.stack.find((layer: any) => 
      layer.route && layer.route.path === '/available-spots' && layer.route.methods.get
    );
    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(getAvailableSpots);
  });

  it('should map POST /spots to createParkingSpot controller', () => {
    const route = router.stack.find((layer: any) => 
      layer.route && layer.route.path === '/spots' && layer.route.methods.post
    );
    expect(route).toBeDefined();
    expect(route.route.stack[0].handle).toBe(createParkingSpot);
  });
});
