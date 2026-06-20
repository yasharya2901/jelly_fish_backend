import Fastify from 'fastify';
import { createLogger } from './shared/utils/logger.js';
import authRoutes from './modules/auth/auth.routes.js';
import { initializeEnvironmentVariables } from './config/env.js';
import connectWithDb from './plugins/db.js';
import { AppError } from './shared/errors/AppError.js';
import z, { success } from 'zod';
import { StatusCodes } from 'http-status-codes';


const PORT: number = Number(process.env.PORT) || 8000;
const HOST: string = process.env.HOST ?? "0.0.0.0";

const logger = createLogger(import.meta.url);

const fastify = Fastify({
    loggerInstance: logger
});

fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
            success: false,
            data: error.message
        });
    }

    if (error instanceof z.ZodError) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            success: false,
            data: error.message
        });
    }

    request.log.error(error);
    return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send({
        success: false,
        data: "Internal Server Error"
    })
})

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
