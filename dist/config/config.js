"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYS = exports.getKeys = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const env = process.env;
const getKeys = () => {
    const keys = {
        port: env.PORT || '5000',
        cloudName: env.CLOUDINARY_CLOUD_NAME || '',
        apiKey: env.CLOUDINARY_API_KEY || '',
        apiSecret: env.CLOUDINARY_API_SECRET || '',
        host: env.HOST || 'localhost',
        serverHost: env.SERVER_HOST || '',
        appEnv: env.APP_ENV || 'development',
        mongoUri: env.MONGODB_URI || '',
        webAppLink: env.WEB_APP_LINK || '',
        serverUsername: env.SERVER_USERNAME || '',
        serverPassword: env.SERVER_PASSWORD || '',
        jwtSecret: env.JWT_SECRET || '',
        email: env.EMAIL || '',
        emailPassword: env.EMAIL_PASSWORD || '',
        adminCode: env.ADMIN_CODE || '',
        codeExpirationMinutes: env.CODE_EXPIRATION_MINUTES || '2',
    };
    // Validate required keys
    const missingKeys = Object.entries(keys)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => !value)
        .map(([key]) => key);
    if (missingKeys.length) {
        throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
    }
    return keys;
};
exports.getKeys = getKeys;
exports.KEYS = (0, exports.getKeys)();
