import type { FastifyPluginAsync } from "fastify";
import { StatusCodes } from "http-status-codes";
import { createLogger } from "../../shared/utils/logger.js";
import { registerUserRequest } from "./auth.schema.js";
import { generalResponse } from "../users/user.schema.js";
import { authService } from "./auth.service.js";

const logger = createLogger(import.meta.url);

const authRoutes: FastifyPluginAsync = async (fastify, options) => {
    fastify.post("/register", async (request, reply) => {
        let requestBody;
        try {
            requestBody = registerUserRequest.parse(request.body);
            logger.info(requestBody);
        } catch (error) {
            // TODO: Implement better error handling
            const response = generalResponse.parse({
                success: false,
                data: `${error}`
            })
            return reply.code(StatusCodes.BAD_REQUEST).send(response);
        }
        let registrationToken;
        
        // Call the register service
        try {
            registrationToken = await authService.registerUser(requestBody.emailId, requestBody.inviteCode)
        } catch (error) {
            logger.error(`Error registering user: ${error}`);
            const response = generalResponse.parse({
                success: false,
                data: "Error during registration"
            })
            return reply.code(StatusCodes.INTERNAL_SERVER_ERROR).send(response);
        }

        const response = generalResponse.parse({
            success: true,
            data: {
                message: "Registration Successful",
                registrationToken: registrationToken
            }
        })

        return reply.code(StatusCodes.CREATED).send(response);

    });
};

export default authRoutes;