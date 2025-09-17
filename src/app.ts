const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const parkingRoutes = require('./routes/parkingRoutes');

dotenv.config();
const app = express();
app.use(express.json());

app.use('/api/health', (req: any, res: any) => {
  res.status(200).send('Parking Lot Management System is running');
});

app.use('/api/parking', parkingRoutes);

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGODB_URI is not defined');
}

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.error('MongoDB connection error:', err);
  });

export default app;
