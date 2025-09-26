import { z } from 'zod';

export const getSigninSchema = () => {
  return z.object({
    username: z
      .string()
      .min(1, { message: 'Username is required.' }),
    password: z.string().min(1, { message: 'Password is required.' }),
    rememberMe: z.boolean().optional(),
  });
};

export type SigninSchemaType = z.infer<ReturnType<typeof getSigninSchema>>;
