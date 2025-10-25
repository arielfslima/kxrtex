import cron from 'node-cron';
import { autoAprovarCheckIns } from '../controllers/checkin.controller.v2.js';

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

  console.log('Scheduled jobs iniciados:');
  console.log('  - Auto-aprovação de check-ins: a cada 10 minutos');
};
