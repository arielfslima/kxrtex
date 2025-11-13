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
        <h2 className="text-4xl font-bold text-white">Pagamento</h2>
        <p className="text-gray-400 text-lg">
          Sistema seguro de pagamento com retenção até conclusão do evento
        </p>
      </div>

      {paymentStatus === 'confirmed' ? (
        <div className="bg-green-500/10 border-2 border-green-500 rounded-2xl p-8 text-center space-y-4">
          <div className="text-6xl">✓</div>
          <h3 className="text-3xl font-bold text-green-500">Pagamento Confirmado!</h3>
          <p className="text-gray-300">
            Seu pagamento foi processado com sucesso.
          </p>
          <div className="bg-dark-800/50 rounded-xl p-4 max-w-md mx-auto">
            <h4 className="font-semibold text-white mb-2">Próximos Passos:</h4>
            <ul className="text-sm text-gray-300 space-y-1 text-left">
              <li>✓ Valor retido pela plataforma</li>
              <li>✓ Chat liberado com o artista</li>
              <li>✓ Aguardar realização do evento</li>
              <li>✓ Check-in/check-out obrigatórios</li>
              <li>✓ Valor liberado 48h após o evento</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Método de Pagamento
              </h3>

              <div className="space-y-3">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`w-full p-4 rounded-xl border-2 transition ${
                    paymentMethod === 'pix'
                      ? 'border-red-vibrant bg-red-vibrant/10'
                      : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">📱</div>
                    <div className="text-left">
                      <div className="font-semibold text-white">PIX</div>
                      <div className="text-sm text-gray-400">
                        Aprovação instantânea
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-4 rounded-xl border-2 transition ${
                    paymentMethod === 'card'
                      ? 'border-red-vibrant bg-red-vibrant/10'
                      : 'border-dark-600 bg-dark-700/50 hover:border-dark-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">💳</div>
                    <div className="text-left">
                      <div className="font-semibold text-white">
                        Cartão de Crédito
                      </div>
                      <div className="text-sm text-gray-400">
                        Parcelamento disponível
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Resumo do Pagamento
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor do Booking</span>
                  <span className="text-white">
                    R$ {bookingValue.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Taxa Plataforma (7%)</span>
                  <span className="text-white">
                    R$ {platformFee.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="border-t border-dark-600 pt-3 flex justify-between font-semibold">
                  <span className="text-white">Total a Pagar</span>
                  <span className="text-red-vibrant text-xl">
                    R$ {totalValue.toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <span>🛡️</span>
                Segurança do Pagamento
              </h4>
              <ul className="text-sm text-yellow-300 space-y-1">
                <li>• Valor retido até 48h após o evento</li>
                <li>• Proteção contra fraudes e cancelamentos</li>
                <li>• Sistema de disputa disponível</li>
                <li>• Reembolso garantido em casos válidos</li>
              </ul>
            </div>
          </div>

          <div className="bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-2xl p-6">
            {paymentMethod === 'pix' ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Pagar com PIX
                  </h3>
                  <p className="text-sm text-gray-400">
                    Escaneie o QR Code ou copie o código
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl">
                  <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">📱</div>
                      <div className="text-sm">QR Code PIX</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value="00020126580014br.gov.bcb.pix..."
                      readOnly
                      className="flex-1 bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 text-sm font-mono"
                    />
                    <button className="px-4 py-2 bg-red-vibrant text-white rounded-lg hover:bg-red-600 transition">
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                  <p className="text-blue-400 text-sm">
                    Aguardando pagamento...
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    Confirmação automática em {countdown}s (simulação)
                  </p>
                </div>

                <div className="text-center text-sm text-gray-400">
                  <p>Após o pagamento, a confirmação é automática</p>
                  <p>Tempo médio: 5-10 segundos</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Pagar com Cartão
                  </h3>
                  <p className="text-sm text-gray-400">
                    Preencha os dados do cartão
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    placeholder="NOME COMPLETO"
                    className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Validade
                    </label>
                    <input
                      type="text"
                      placeholder="MM/AA"
                      className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      maxLength="4"
                      className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Parcelas
                  </label>
                  <select className="w-full bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-red-vibrant">
                    <option>1x de R$ 6.420,00 sem juros</option>
                    <option>2x de R$ 3.210,00 sem juros</option>
                    <option>3x de R$ 2.140,00 sem juros</option>
                    <option>4x de R$ 1.605,00 sem juros</option>
                  </select>
                </div>

                <button className="w-full px-6 py-3 bg-gradient-to-r from-red-vibrant to-pink-600 text-white rounded-lg hover:scale-105 transition font-semibold shadow-lg shadow-red-vibrant/30">
                  Finalizar Pagamento
                </button>

                <div className="flex items-center justify-center gap-4 text-gray-400 text-xs">
                  <span>🔒 Pagamento Seguro</span>
                  <span>•</span>
                  <span>SSL Criptografado</span>
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
