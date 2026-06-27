import { StatusCodes } from "http-status-codes";
import type { FastifyReply, FastifyRequest } from "fastify";

import { registerUserRequest, resendOtpRequest, verifyOtpRequest } from "./auth.schema.js";
import { authService } from "./auth.service.js";
import type { GeneralResponse } from "../../shared/types/type.js";

async function register(
    request: FastifyRequest,
    reply: FastifyReply
) {
    let requestBody = registerUserRequest.parse(request.body);

    const registrationToken = await authService.registerUser(
        requestBody.emailId,
        requestBody.inviteCode,
        requestBody.deviceId
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

async function verifyOtp(request: FastifyRequest, reply: FastifyReply) {
    let requestBody = verifyOtpRequest.parse(request.body);

    const { accessToken, refreshToken } = await authService.verifyOtp(requestBody.token, requestBody.otp);

    const response: GeneralResponse<{accessToken: string, refreshToken: string}> = {
        success: true,
        data: {
            accessToken,
            refreshToken
        }
    }

    return reply.code(StatusCodes.OK).send(response);
}

async function resendOtp(request: FastifyRequest, reply: FastifyReply) {
    let requestBody = resendOtpRequest.parse(request.body);

    const isSentSuccessful = await authService.resendOtp(requestBody.token);

    const response: GeneralResponse<{message: string}> = {
        success: true,
        data: {
            message: isSentSuccessful ? "OTP sent successfully" : "Failed to send OTP"
        }
    }

    return reply.code(StatusCodes.OK).send(response);
}

async function refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const refreshToken = request.headers["x-refresh-token"] as string;

    if (!refreshToken) {
        return reply.code(StatusCodes.BAD_REQUEST).send({
            success: false,
            data: "Missing refresh token in request headers"
        });
    }

    const newToken = await authService.refreshToken(refreshToken);

    const response: GeneralResponse<{accessToken: string, refreshToken: string}> = {
        success: true,
        data: {
            accessToken: newToken.accessToken,
            refreshToken: newToken.refreshToken
        }
    }

    return reply.code(StatusCodes.OK).send(response);
}

export const authController = {
    register,
    verifyOtp,
    resendOtp,
    refreshToken,
};