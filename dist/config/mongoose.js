"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToMongoose = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config");
dotenv_1.default.config(); // Load environment variables
const mongoURI = config_1.KEYS.mongoUri;
if (!mongoURI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
let isConnected = false; // Track the connection status
const connectToMongoose = async () => {
    if (isConnected) {
        console.log('Database is already connected');
        return;
    }
    try {
        await mongoose_1.default.connect(mongoURI, {});
        isConnected = !!mongoose_1.default.connection.readyState; // 1 means connected
        console.log('Mongoose connected successfully');
    }
    catch (error) {
        console.error('Mongoose connection error:', error);
        throw new Error('Failed to connect to Mongoose');
    }
};
exports.connectToMongoose = connectToMongoose;
mongoose_1.default.connection.on('connected', () => {
    console.log('MongoDB connected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});
