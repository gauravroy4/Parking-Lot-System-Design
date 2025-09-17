# Smart Parking Lot System

A low-level design implementation for a smart parking lot backend system using Node.js, TypeScript, Express, and MongoDB.

## Features
- Automatic parking spot allocation based on vehicle size
- Real-time parking spot availability tracking
- Vehicle check-in/check-out functionality
- Fee calculation based on duration and vehicle type
- MongoDB transactions for concurrency handling
- RESTful API endpoints

## Prerequisites
- Node.js (v18+)
- MongoDB (must be running)
- npm

## Setup
1. Install dependencies:
```bash
npm install
```

2. Start MongoDB service:
```bash
# Windows (if installed as service)
net start MongoDB

# Or start manually from MongoDB installation directory
bin\mongod.exe
```

3. Create `.env` file with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/parkinglot
```

4. Start the application:
```bash
npm run dev
```

## API Endpoints

### Create Parking Spot
**POST** `/api/parking/spots`

**Request Body:**
```json
{
  "floor": 1,
  "spotNumber": 1,
  "size": "car"
}
```

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/parking/spots \
  -H "Content-Type: application/json" \
  -d '{
    "floor": 1,
    "spotNumber": 1,
    "size": "car"
  }'
```

**Response:**
```json
{
  "message": "Parking spot created successfully",
  "spot": {
    "floor": 1,
    "spotNumber": 1,
    "size": "car",
    "isAvailable": true
  }
}
```

### Check-In Vehicle
**POST** `/api/parking/check-in`

**Request Body:**
```json
{
  "licensePlate": "ABC-123",
  "vehicleSize": "car"
}
```

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/parking/check-in \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "MH-04-AB-1234",
    "vehicleSize": "car"
  }'
```

**Response:**
```json
{
  "message": "Vehicle checked in successfully",
  "spot": {
    "floor": 1,
    "spotNumber": 5,
    "size": "car"
  }
}
```

### Get Available Parking Spots
**GET** `/api/parking/available-spots`

**Sample Request:**
```bash
curl -X GET http://localhost:3000/api/parking/available-spots
```

**Response:**
```json
{
  "message": "Available parking spots retrieved successfully",
  "count": 3,
  "spots": [
    {
      "floor": 1,
      "spotNumber": 1,
      "size": "motorcycle"
    },
    {
      "floor": 1,
      "spotNumber": 2,
      "size": "car"
    },
    {
      "floor": 2,
      "spotNumber": 1,
      "size": "bus"
    }
  ]
}
```

### Check-Out Vehicle
**POST** `/api/parking/check-out`

**Request Body:**
```json
{
  "licensePlate": "ABC-123"
}
```

**Sample Request:**
```bash
curl -X POST http://localhost:3000/api/parking/check-out \
  -H "Content-Type: application/json" \
  -d '{
    "licensePlate": "MH-04-AB-1234"
  }'
```

**Response:**
```json
{
  "message": "Vehicle checked out successfully",
  "fee": 40,
  "durationHours": 2,
  "exitTime": "2023-09-14T12:30:00.000Z"
}
```

## Fee Calculation
Fees are calculated based on vehicle type and duration (rounded up to nearest hour):

| Vehicle Type | Rate per Hour |
|--------------|---------------|
| Motorcycle   | $10           |
| Car          | $20           |
| Bus          | $30           |

## Data Models
- **ParkingSpot**: Tracks floor, spot number, size capacity, and availability
- **Vehicle**: Stores license plate and vehicle size
- **Transaction**: Records entry/exit times, fee, and associated spot/vehicle

## Architecture Notes
- Uses MongoDB transactions to handle concurrent check-in operations
- Implements CommonJS module system for compatibility
- Follows RESTful API design principles
- Type-safe with TypeScript interfaces

## Testing
The project includes unit and integration tests using Jest. Test files are organized in the `test/` directory, grouped by modules (controllers, models, routes). Special focus is given to concurrency scenarios:

- **Concurrency Tests**: `test/controllers/concurrencyTests.ts` verifies proper handling of simultaneous check-ins and prevents double booking through MongoDB transactions
- **Full Test Suite**: Includes validation of core functionality, edge cases, and race conditions

To run tests:
```bash
npm test
```
