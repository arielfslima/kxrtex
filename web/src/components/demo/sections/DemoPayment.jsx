import { useState, useEffect } from 'react';

const DemoPayment = () => {
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(5);

  const bookingValue = 6000.00;
  const platformFee = 420.00;
  const totalValue = 6420.00;

  useEffect(() => {
    if (paymentMethod === 'pix' && paymentStatus === 'pending') {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setPaymentStatus('confirmed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentMethod, paymentStatus]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black font-display text-chrome uppercase tracking-wider">
          Pagamento
        </h2>
        <p className="text-chrome/50 font-mono text-sm uppercase tracking-widest">
          Sistema seguro de pagamento com retencao ate conclusao do evento
        </p>
      </div>

      {paymentStatus === 'confirmed' ? (
        <div className="border-4 border-neon-acid bg-neon-acid/10 p-8 text-center space-y-4">
          <div className="text-6xl font-mono text-neon-acid">[OK]</div>
          <h3 className="text-3xl font-black font-display text-neon-acid">PAGAMENTO CONFIRMADO!</h3>
          <p className="text-chrome/70 font-mono text-sm">
            Seu pagamento foi processado com sucesso.
          </p>
          <div className="border-2 border-dark-600 bg-dark-900/50 p-4 max-w-md mx-auto">
            <h4 className="font-mono font-bold text-chrome text-xs uppercase tracking-wider mb-3">
              [PROXIMOS PASSOS]
            </h4>
            <ul className="text-xs font-mono text-chrome/70 space-y-2 text-left">
              <li className="flex items-center gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span>Valor retido pela plataforma</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-acid">[OK]</span>
                <span>Chat liberado com o artista</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-gold">[..]</span>
                <span>Aguardar realizacao do evento</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-gold">[..]</span>
                <span>Check-in/check-out obrigatorios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-neon-gold">[..]</span>
                <span>Valor liberado 48h apos o evento</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
              <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
                [METODO DE PAGAMENTO]
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full p-4 border-2 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-neon-red bg-neon-red/10'
                      : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-mono text-neon-acid">[PIX]</div>
                    <div className="text-left">
                      <div className="font-mono font-bold text-chrome text-sm">PIX</div>
                      <div className="text-xs font-mono text-chrome/50">Aprovacao instantanea</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-neon-red bg-neon-red/10'
                      : 'border-dark-600 bg-dark-800/50 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-mono text-neon-cyan">[CC]</div>
                    <div className="text-left">
                      <div className="font-mono font-bold text-chrome text-sm">Cartao de Credito</div>
                      <div className="text-xs font-mono text-chrome/50">Parcelamento disponivel</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
              <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider border-b-2 border-dark-600 pb-2 mb-4">
                [RESUMO]
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">VALOR DO BOOKING</span>
                  <span className="text-chrome">R$ {bookingValue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between border-b border-dark-700 pb-2">
                  <span className="text-chrome/50">TAXA PLATAFORMA (7%)</span>
                  <span className="text-chrome">R$ {platformFee.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm">
                  <span className="text-chrome font-bold">TOTAL A PAGAR</span>
                  <span className="text-neon-acid font-bold text-xl">
                    R$ {totalValue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-neon-gold/30 bg-neon-gold/5 p-4">
              <h4 className="font-mono font-bold text-neon-gold text-xs uppercase tracking-wider mb-2">
                [SEGURANCA] PAGAMENTO PROTEGIDO
              </h4>
              <ul className="text-xs font-mono text-neon-gold/80 space-y-1">
                <li>- Valor retido ate 48h apos o evento</li>
                <li>- Protecao contra fraudes e cancelamentos</li>
                <li>- Sistema de disputa disponivel</li>
                <li>- Reembolso garantido em casos validos</li>
              </ul>
            </div>
          </div>

          <div className="border-2 border-dark-600 bg-dark-900/50 p-6">
            {paymentMethod === 'pix' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-2">
                    [PAGAR COM PIX]
                  </h3>
                  <p className="text-xs font-mono text-chrome/50">
                    Escaneie o QR Code ou copie o codigo
                  </p>
                </div>

                <div className="bg-chrome p-4">
                  <div className="aspect-square bg-dark-950 flex items-center justify-center">
                    <div className="text-center text-neon-acid font-mono">
                      <div className="text-4xl mb-2">[QR]</div>
                      <div className="text-xs">CODIGO PIX</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                    Codigo PIX Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="00020126580014br.gov.bcb.pix..."
                      readOnly
                      className="flex-1 px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-xs"
                    />
                    <button className="px-4 py-3 border-2 border-neon-red bg-neon-red text-dark-950 font-mono text-xs font-bold uppercase">
                      COPIAR
                    </button>
                  </div>
                </div>

                <div className="border-2 border-neon-cyan/30 bg-neon-cyan/5 p-4 text-center">
                  <p className="text-neon-cyan font-mono text-xs uppercase tracking-wider">
                    Aguardando pagamento...
                  </p>
                  <p className="text-neon-cyan/70 font-mono text-[10px] mt-1">
                    Confirmacao automatica em {countdown}s (simulacao)
                  </p>
                </div>

                <div className="text-center text-xs font-mono text-chrome/50">
                  <p>Apos o pagamento, a confirmacao e automatica</p>
                  <p>Tempo medio: 5-10 segundos</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-mono font-bold text-chrome uppercase tracking-wider mb-2">
                    [PAGAR COM CARTAO]
                  </h3>
                  <p className="text-xs font-mono text-chrome/50">
                    Preencha os dados do cartao
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                    Numero do Cartao
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                    Nome no Cartao
                  </label>
                  <input
                    type="text"
                    placeholder="NOME COMPLETO"
                    className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                      Validade
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="4"
                      className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm placeholder-chrome/30 focus:outline-none focus:border-neon-red transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-chrome/50 uppercase tracking-wider mb-2">
                    Parcelas
                  </label>
                  <select className="w-full px-4 py-3 bg-dark-800 border-2 border-dark-600 text-chrome font-mono text-sm focus:outline-none focus:border-neon-red transition-colors">
                    <option>1x de R$ 6.420,00 sem juros</option>
                    <option>2x de R$ 3.210,00 sem juros</option>
                    <option>3x de R$ 2.140,00 sem juros</option>
                    <option>4x de R$ 1.605,00 sem juros</option>
                  </select>
                </div>

                <button className="w-full px-6 py-4 border-2 border-neon-red bg-neon-red text-dark-950 font-mono font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_30px_rgba(255,0,68,0.5)] transition-all">
                  FINALIZAR PAGAMENTO
                </button>

                <div className="flex items-center justify-center gap-4 text-chrome/50 font-mono text-[10px] uppercase">
                  <span>[LOCK] PAGAMENTO SEGURO</span>
                  <span>|</span>
                  <span>SSL CRIPTOGRAFADO</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoPayment;
