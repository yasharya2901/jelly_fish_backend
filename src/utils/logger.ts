import pino from "pino";


const isDevelopment: boolean = process.env.NODE_ENV != "production";

export const logger = pino({
    level: process.env.LOG_LEVEL ?? "info",
    ...(isDevelopment && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "yyyy-mm-dd HH:MM:ss",
                ignore: "pid,hostname,module",
                messageFormat: "[{module}] {msg}"
            }
        }
    })
});
