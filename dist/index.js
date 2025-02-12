"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// apollo-server.ts
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("./config/mongoose");
const auth_schema_1 = require("./graphql/schema/auth.schema");
const resolvers_1 = require("./graphql/resolvers/resolvers");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config/config"); // Adjust the path based on your config location
dotenv_1.default.config();
const JWT_SECRET = config_1.KEYS.jwtSecret;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const context = ({ req }) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return { req: { user: decoded } };
        }
        catch (error) {
            console.error('Token verification failed:', error);
            return { req: { user: null } };
        }
    }
    return { req: { user: null } };
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const app = (0, express_1.default)();
const startServer = async () => {
    await (0, mongoose_1.connectToMongoose)();
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs: auth_schema_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context,
    });
    await server.start();
    server.applyMiddleware({ app });
    app.listen(4000, () => {
        console.log(`🚀 Server running at http://localhost:4000${server.graphqlPath}`);
    });
};
startServer();
