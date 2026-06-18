import { StatusCodes } from "http-status-codes";
import type { FastifyReply, FastifyRequest } from "fastify";

import { registerUserRequest } from "./auth.schema.js";
import { generalResponse } from "../users/user.schema.js";
import { authService } from "./auth.service.js";
import { createLogger } from "../../shared/utils/logger.js";

const logger = createLogger(import.meta.url);

async function register(
    request: FastifyRequest,
    reply: FastifyReply
) {
    let requestBody;

    try {
        requestBody = registerUserRequest.parse(request.body);
        logger.info(requestBody);
    } catch (error) {
        const response = generalResponse.parse({
            success: false,
            data: `${error}`,
        });

        return reply.code(StatusCodes.BAD_REQUEST).send(response);
    }

    try {
        const registrationToken = await authService.registerUser(
            requestBody.emailId,
            requestBody.inviteCode
        );

        const response = generalResponse.parse({
            success: true,
            data: {
                message: "Registration Successful",
                registrationToken,
            },
        });

        return reply.code(StatusCodes.CREATED).send(response);
    } catch (error) {
        logger.error(`Error registering user: ${error}`);

        const response = generalResponse.parse({
            success: false,
            data: "Error during registration",
        });

        return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send(response);
    }
}

export const authController = {
    register,
};