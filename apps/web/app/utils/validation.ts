import {optional, z} from 'zod'

export const userdata = z.object({
    name : z.string(),
    username : z.string(),
    email : z.email(),
    password : z.string().min(8).max(16)
})

export const orderdata = z.object({
    orderID : z.string(),
    symbol: z.string().regex(/^[A-Z0-9]+\/[A-Z0-9]+$/, "Symbol must use BASE/QUOTE format"),
    side : z.enum(["BUY","SELL"]),
    type : z.enum(["MARKET","LIMIT"]),
    price : z.string(),
    quantity: z.string(),
    kind : z.enum(["ioc"]).optional(),
})
