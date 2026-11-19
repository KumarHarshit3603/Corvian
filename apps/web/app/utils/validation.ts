import { z } from 'zod'

export const signupData = z.object({
  name: z.string().trim().min(1, "Enter your full name.").max(80, "Use 80 characters or fewer for your name."),
  email: z.email("Enter a valid email address.").transform((email) => email.toLowerCase()),
  password: z.string()
    .min(8, "Choose a password with at least 8 characters.")
    .max(72, "Choose a password with no more than 72 characters."),
});

export const signinData = z.object({
  email: z.email("Enter the email address used for your account.").transform((email) => email.toLowerCase()),
  password: z.string().min(1, "Enter your password.").max(72, "Password is too long."),
});

export const orderdata = z.object({
    orderID : z.string(),
    symbol: z.string().regex(/^[A-Z0-9]+\/[A-Z0-9]+$/, "Symbol must use BASE/QUOTE format"),
    side : z.enum(["BUY","SELL"]),
    type : z.enum(["MARKET","LIMIT"]),
    price : z.string(),
    quantity: z.string(),
    kind : z.enum(["ioc"]).optional(),
})
