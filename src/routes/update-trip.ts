import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";



export async function updateTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().put('/trips/:tripId', {
        schema: {
        params: z.object({ tripId: z.string().uuid() }),
         body: z.object({
            destination: z.string().min(4),
            starts_at: z.coerce.date(),
            ends_at: z.coerce.date(),
        })
    },
},

async (request) => {
    const { destination, starts_at, ends_at } = request.body;

    const { tripId } = request.params

    const trip = await prisma.trip.findUnique({
        where: { id: tripId},
     })

    if (!trip) {
        throw new Error('Trip not found')
     }

    if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip start date')
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip end date')
    }

     
    await prisma.trip.update({
        where: { id: tripId},
        data: {
            destination,
            starts_at,
            ends_at,
        }
    })

    return {tripId: trip.id}
})
}