"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const router_1 = __importDefault(require("./router"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const envAllowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://localhost:5174',
    'https://nitropicks.xyz',
    'https://www.nitropicks.xyz',
    ...envAllowedOrigins,
]);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            allowedOrigins.has(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
mongoose_1.default.Promise = Promise;
const mongoUri = process.env.MONGO_DB_URL || process.env.MONGO_DB_URI || process.env.MONGODB_URI;
if (!mongoUri)
    throw new Error('No MongoDB URI found in environment variables');
mongoose_1.default.connect(mongoUri);
mongoose_1.default.connection.on('error', (error) => console.log(error));
app.use('/api', (0, router_1.default)());
// Serve the built React client in production only
if (process.env.NODE_ENV === 'production') {
    const clientDist = path_1.default.join(__dirname, '../../client/dist');
    app.use(express_1.default.static(clientDist));
    app.get('/{*path}', (_req, res) => {
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
//# sourceMappingURL=index.js.map