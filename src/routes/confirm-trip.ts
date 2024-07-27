import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { promise, z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";


export async function confirmTrip(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/trips/confirm-trip/:tripId', {
        schema: {
         params: z.object({
            tripId: z.string().uuid(),
         })
    },
}, 
 async (request, reply) => {
   
   const { tripId } = request.params;

   const trip = await prisma.trip.findUnique({
      where: {
            id: tripId
         },
      include: {
         participantes: {
            where: {
               is_owner: false,
            }
         }
      } 
   })

   if (!trip) {
      throw new Error('Trip not found')
   }

   if (trip.is_confirmed) {
      return reply.redirect(`http://localhost:3000/trips/${trip.id}`)

   }

   await prisma.trip.update({
      where: { id: tripId },
      data: { is_confirmed: true },
   }) 


   const formattedStartsAt = dayjs(trip.starts_at).format('LL')
   const formattedEndsAt = dayjs(trip.ends_at).format('LL')


    const mail = await getMailClient()

   await Promise.all(trip.participantes.map(async (participantes) => {
      const confirmationlink = `http://localhost:3000/participantes/confirm/${participantes.id}`
      const menssage = await mail.sendMail({
         from:{ 
         name: 'Apogeu',
         address:'eumesmo@email.com',
     },
 
     to: participantes.email,
   
     subject: `Confirmação de viagem para ${trip.destination} em ${formattedStartsAt}`,
     html: `
     <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
     <p></p>
     <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong>, nas datas de <strong>${formattedStartsAt}</strong> a <strong>${formattedEndsAt}</strong></p>
     <p></p>
     <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
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
   }))


   return reply.redirect(`http://localhost:3000/trips/${trip.id}`)
 })
}



