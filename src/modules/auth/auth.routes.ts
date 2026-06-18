import type { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller.js";

const authRoutes: FastifyPluginAsync = async (fastify, options) => {
    fastify.post("/register", authController.register);
};

export default authRoutes;