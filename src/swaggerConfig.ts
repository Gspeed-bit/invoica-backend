import { KEYS } from 'config/config';
import swaggerJSDoc from 'swagger-jsdoc';


const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Invoica API',
      version: '1.0.0',
      description: 'API documentation for Invoica freelance invoicing system',
      contact: {
        name: 'Invoica Dev Team',
        email: 'support@invoica.com',
      },
    },
    servers: [
      {
        url: `${KEYS.serverHost}`,
        description: `${KEYS.appEnv} Server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/components/auth/routes/**/*.ts',
    './src/components/invoice/routes/**/*.ts',
    './src/components/payment/routes/**/*.ts',
  ],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export default swaggerDocs;
