import pino from "pino";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isDevelopment: boolean = process.env.NODE_ENV != "production";

const log = pino({
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

export function createLogger(fileUrl: string) {
    const filePath = fileURLToPath(fileUrl);
    const modulePath = path
        .relative(process.cwd(), filePath)
        .replace(/\\/g, "/");

    return log.child({
        module: `${modulePath}`
    });
}