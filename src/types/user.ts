import { success, z } from 'zod';



export const generalResponse = z.object({
    success: z.boolean(),
    data: z.unknown()
})