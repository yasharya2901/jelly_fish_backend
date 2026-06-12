import Fastify from 'fastify';
import {logger} from './utils/logger.js';

const PORT: number = Number(process.env.PORT) || 8000;
const HOST: string = process.env.HOST ?? "0.0.0.0";

const mainLogger = logger.child({
    module: "main"
})

const fastify = Fastify({
    loggerInstance: mainLogger
})

fastify.get("/", (req, res) => {
    res.send({message: "Hello TCP user"})
})



async function startServer() {
    mainLogger.info("Server Starting...")
    try {
        fastify.listen({
            port: PORT,
            host: HOST
        })
    } catch (error) {
        fastify.log.error(error)
        process.exit(1)
    }
}

startServer()