import {z} from 'zod'

export const userdata = z.object({
    name : z.string(),
    username : z.string(),
    email : z.email(),
    password : z.string()
})
