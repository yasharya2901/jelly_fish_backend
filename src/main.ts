import Fastify from 'fastify';
import {createLogger} from './utils/logger.js';
import connectWithDb from './utils/db.js';
import { initializeEnvironmentVariables } from './utils/env.js';
import authRoutes from './routes/auth.route.js';

const PORT: number = Number(process.env.PORT) || 8000;
const HOST: string = process.env.HOST ?? "0.0.0.0";

const logger = createLogger(import.meta.url);

const fastify = Fastify({
    loggerInstance: logger
});

fastify.register(authRoutes, { prefix: '/api/v0/auth' });

async function startServer() {
    logger.info("Server Starting...");
    try {
        await initializeEnvironmentVariables();
        await connectWithDb();
        await fastify.listen({
            port: PORT,
            host: HOST
        })
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

startServer()
