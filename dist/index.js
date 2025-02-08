"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("./config/mongoose");
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const swaggerConfig_1 = __importDefault(require("./swaggerConfig"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const config_1 = require("./config/config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => {
    res.send('Welcome to the Invoica Backend');
});
// MongoDB connection
(0, mongoose_1.connectToMongoose)()
    .then(() => {
    console.log('MongoDB connected');
})
    .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});
app.use('/api-docs', (0, express_basic_auth_1.default)({
    users: { [config_1.KEYS.serverUsername]: config_1.KEYS.serverPassword },
    challenge: true,
    realm: 'Protected API',
}), swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerConfig_1.default));
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
