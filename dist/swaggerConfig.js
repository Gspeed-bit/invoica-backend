"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config/config");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
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
                url: `${config_1.KEYS.serverHost}`,
                description: `${config_1.KEYS.appEnv} Server`,
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
        './src/components/user/routes/**/*.ts',
        './src/components/invoice/routes/**/*.ts',
        './src/components/payment/routes/**/*.ts',
    ],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
exports.default = swaggerDocs;
