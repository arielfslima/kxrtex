import cron from 'node-cron';
import { autoAprovarCheckIns } from '../controllers/checkin.controller.v2.js';
import prisma from '../config/database.js';

/**
 * Auto-finaliza eventos que passaram da duração prevista + 2h
 */
const autoFinalizarEventos = async () => {
  try {
    const agora = new Date();

    // Busca bookings em andamento
    const bookingsEmAndamento = await prisma.booking.findMany({
      where: {
        status: 'EM_ANDAMENTO'
      },
      include: {
        artista: {
          include: {
            usuario: true
          }
        }
      }
    });

    let finalizados = 0;

    for (const booking of bookingsEmAndamento) {
      // Calcula hora de fim do evento (dataEvento + horarioInicio + duracao + 2h de tolerância)
      const dataEvento = new Date(booking.dataEvento);
      const [horas, minutos] = booking.horarioInicio.split(':');
      const inicioEvento = new Date(dataEvento);
      inicioEvento.setHours(parseInt(horas), parseInt(minutos), 0);

      const fimEvento = new Date(inicioEvento);
      fimEvento.setHours(fimEvento.getHours() + booking.duracao + 2); // +2h de tolerância

      // Se já passou do fim previsto + 2h, finaliza automaticamente
      if (agora > fimEvento) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONCLUIDO' }
        });

        await prisma.mensagem.create({
          data: {
            bookingId: booking.id,
            remetenteId: booking.artista.usuarioId,
            conteudo: `🤖 Evento finalizado automaticamente pelo sistema
⏰ Tempo previsto do evento expirado (${booking.duracao}h + 2h de tolerância)

💰 Pagamento será liberado em 48h.
⭐ Não esqueça de avaliar o ${booking.artista.nomeArtistico}!`,
            tipo: 'SISTEMA'
          }
        });

        finalizados++;
        console.log(`[AUTO-FINALIZAR] Booking ${booking.id} finalizado automaticamente`);
      }
    }

    return { finalizados };
  } catch (error) {
    console.error('[AUTO-FINALIZAR] Erro:', error);
    throw error;
  }
};

export const startScheduledJobs = () => {
  // Auto-aprovar check-ins pendentes após 1 hora (roda a cada 10 minutos)
  cron.schedule('*/10 * * * *', async () => {
    try {
      console.log('[CRON] Executando auto-aprovação de check-ins...');
      const resultado = await autoAprovarCheckIns();
      if (resultado.aprovados > 0) {
        console.log(`[CRON] ${resultado.aprovados} check-ins auto-aprovados com sucesso`);
      }
    } catch (error) {
      console.error('[CRON] Erro ao auto-aprovar check-ins:', error);
    }
  });

  // Auto-finalizar eventos após duração + 2h (roda a cada 30 minutos)
  cron.schedule('*/30 * * * *', async () => {
    try {
      console.log('[CRON] Executando auto-finalização de eventos...');
      const resultado = await autoFinalizarEventos();
      if (resultado.finalizados > 0) {
        console.log(`[CRON] ${resultado.finalizados} eventos auto-finalizados com sucesso`);
      }
    } catch (error) {
      console.error('[CRON] Erro ao auto-finalizar eventos:', error);
    }
  });

  console.log('Scheduled jobs iniciados:');
  console.log('  - Auto-aprovação de check-ins: a cada 10 minutos');
  console.log('  - Auto-finalização de eventos: a cada 30 minutos');
};
