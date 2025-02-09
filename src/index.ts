import express from 'express';

import cors from 'cors';
import { connectToMongoose } from './config/mongoose';
import expressBasicAuth from 'express-basic-auth';
import swaggerDocs from './swaggerConfig';
import swaggerUI from 'swagger-ui-express';
import { KEYS } from 'config/config';
import authRoutes from './components/user/routes/authRoutes';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Invoica Backend');
});

// MongoDB connection
connectToMongoose()
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

  app.use('/', authRoutes);

app.use(
  '/api-docs',
  expressBasicAuth({
    users: { [KEYS.serverUsername]: KEYS.serverPassword },
    challenge: true,
    realm: 'Protected API',
  }),
  swaggerUI.serve,
  swaggerUI.setup(swaggerDocs)
);
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
