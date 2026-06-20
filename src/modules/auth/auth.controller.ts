import { StatusCodes } from "http-status-codes";
import type { FastifyReply, FastifyRequest } from "fastify";

import { registerUserRequest } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import type { GeneralResponse } from "../../shared/types/type.js";

async function register(
    request: FastifyRequest,
    reply: FastifyReply
) {
    let requestBody = registerUserRequest.parse(request.body);

    const registrationToken = await authService.registerUser(
        requestBody.emailId,
        requestBody.inviteCode
    );

    const response: GeneralResponse<{message: string, token: string}> = {
        success: true,
        data: {
            message: "Registration Successful",
            token: registrationToken,
        },
    }

    return reply.code(StatusCodes.CREATED).send(response);
}

export const authController = {
    register,
};