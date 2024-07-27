import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";


export async function confirmParticipant(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().get('/participantes/confirm/:participanteId', {
        schema: {
         params: z.object({
            participanteId: z.string().uuid(),
         })
    },
}, 
 async (request, reply) => {
   
   const { participanteId } = request.params;
 
    const participante = await prisma.participante.findUnique({
        where: {
            id: participanteId
        }
    })

    if (!participante) {
        return reply.status(404).send({message: "Participante não encontrado"})
    }

    if (participante.is_confirmed) {
        return reply.redirect(`http://localhost:3000/trips/${participante.tripId}`)
    }

    await prisma.participante.update({
        where: {
            id: participanteId
        },
        data: {
            is_confirmed: true
        }
    })

    return reply.redirect(`http://localhost:3000/trips/${participante.tripId}`)
 })
}
