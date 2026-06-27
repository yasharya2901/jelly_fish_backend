import type { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller.js";

const authRoutes: FastifyPluginAsync = async (fastify, options) => {
    fastify.post("/register", authController.register);
    fastify.post("/verify-otp", authController.verifyOtp);
    fastify.post("/resend-otp", authController.resendOtp);
    fastify.post("/refresh", authController.refreshToken);
};

export default authRoutes;
