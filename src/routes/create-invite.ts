import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import nodemailer from 'nodemailer'
import { dayjs } from '../lib/dayjs'
import { getMailClient } from '../lib/mail'


export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/trips/invites/:tripId',
    {
      schema: {
        params: z.object({
          tripId: z.string().uuid(),
        }),
        body: z.object({
          email: z.string().email(),
        }),
      },
    },
    async (request) => {
      const { tripId } = request.params
      const { email } = request.body

      const trip = await prisma.trip.findUnique({
        where: { id: tripId }
      })

      if (!trip) {
        throw new Error('Trip not found')
      }

      const participantes = await prisma.participante.create({
        data: {
          email,
          tripId,
        }
      })

      const formattedStartsAt = dayjs(trip.starts_at).format('LL')
   const formattedEndsAt = dayjs(trip.ends_at).format('LL')

   const mail = await getMailClient()


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
    return { ParticipanteId: participantes.id }
 })
}