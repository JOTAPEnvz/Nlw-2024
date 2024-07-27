import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";



export async function createTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post('/trips', {
        schema: {
         body: z.object({
            destination: z.string().min(4),
            starts_at: z.coerce.date(),
            ends_at: z.coerce.date(),
            owner_name: z.string(),
            owner_email: z.string().email(),
            emails_to_invite: z.array(z.string().email()),
        })
    },
},

async (request) => {
    const { destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite } = request.body;

    if (dayjs(starts_at).isBefore(new Date())) {
        throw new Error('Invalid trip start date')
    }

    if (dayjs(ends_at).isBefore(starts_at)) {
        throw new Error('Invalid trip end date')
    }

     
    const trip = await prisma.trip.create({
        data: {
            destination,
            starts_at,
            ends_at,
            participantes:{
            createMany:{
                data: [
                    {
                    name: owner_name, 
                    email: owner_email,
                    is_owner: true,
                    is_confirmed: true,
                },
                ...emails_to_invite.map(email => {
                    return { email }
                })
                ],
                }
            }
        } 
    })

    const formattedStartsAt = dayjs(starts_at).format('LL')
    const formattedEndsAt = dayjs(ends_at).format('LL')

    const confirmationlink = `http://localhost:3000/trips/confirm-trip/${trip.id}`

    const mail = await getMailClient()

    const menssage = await mail.sendMail({
        from:{ 
        name: 'Apogeu',
        address:'eumesmo@email.com',
    },

    to:{
        name: owner_name,
        address: owner_email,
    },
    subject: `Confirmação de viagem para ${destination} em ${formattedStartsAt}`,
    html: `
    <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
    <p></p>
    <p>Você solicitou a criação de uma viagem para <strong>${destination}</strong>, nas datas de <strong>${formattedStartsAt}</strong> a <strong>${formattedEndsAt}</strong></p>
    <p></p>
    <p>Para confirmar sua viagem, clique no link abaixo:</p>
    <p></p>
    <p>
        <a href="${confirmationlink}">Confirmar viagem</a>
    </p>
    <p></p>
    <p>Se você não solicitou essa viagem, por favor, ignore este e-mail.</p>
    </div>
    
    

    `.trim(),

    })  
    
    console.log(nodemailer.getTestMessageUrl(menssage))

    return {tripId: trip.id}
})
}