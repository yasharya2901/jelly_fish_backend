import z from "zod";

export const registerUserRequest = z.object({
    emailId: z.email(),
    inviteCode: z.string().max(8),
})
