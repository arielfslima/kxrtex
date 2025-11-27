import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function PaymentModal({ bookingId, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [showPixCode, setShowPixCode] = useState(false);
  const [pixData, setPixData] = useState(null);

  const { data: paymentStatus, refetch: refetchPayment, isLoading: isLoadingPayment } = useQuery({
    queryKey: ['payment', bookingId],
    queryFn: async () => {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data;
    },
    enabled: true,
    retry: false
  });

  useEffect(() => {
    if (paymentStatus?.data) {
      const payment = paymentStatus.data;
      const isPending = payment.status === 'PENDENTE' || payment.status === 'PENDING';
      if (payment.metodo === 'PIX' && isPending && payment.pixQrCode) {
        setPixData({
          qrCode: payment.pixQrCode,
          copyPaste: payment.pixCopyPaste
        });
        setShowPixCode(true);
        startPaymentPolling();
      }
    }
  }, [paymentStatus]);

  const createPaymentMutation = useMutation({
    mutationFn: async (billingType) => {
      const response = await api.post(`/payments/booking/${bookingId}`, {
        billingType
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (paymentMethod === 'PIX' && data.data.pixQrCode) {
        setPixData({
          qrCode: data.data.pixQrCode,
          copyPaste: data.data.pixCopyPaste
        });
        setShowPixCode(true);
        startPaymentPolling();
      } else {
        queryClient.invalidateQueries(['booking', bookingId]);
        queryClient.invalidateQueries(['bookings']);
        onSuccess?.();
      }
    }
  });

  const startPaymentPolling = () => {
    const interval = setInterval(async () => {
      try {
        const { data } = await refetchPayment();
        if (data?.data?.status === 'CONFIRMED' || data?.data?.status === 'RECEIVED') {
          clearInterval(interval);
          queryClient.invalidateQueries(['booking', bookingId]);
          queryClient.invalidateQueries(['bookings']);
          onSuccess?.();
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
      }
    }, 3000);

    setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
  };

  const handleCopyPixCode = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      alert('Codigo PIX copiado!');
    }
  };

  const handlePayment = () => {
    createPaymentMutation.mutate(paymentMethod);
  };

  if (showPixCode && pixData) {
    return (
      <div className="fixed inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-dark-800 border-2 border-neon-red p-8 max-w-md w-full relative shadow-brutal-lg">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-acid"></div>
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-acid"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-acid"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-acid"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-chrome/50 hover:text-neon-red transition-colors text-2xl font-display"
          >
            X
          </button>

          <h2 className="text-3xl font-display tracking-wider text-chrome mb-4 text-center uppercase">
            Pagamento <span className="text-neon-acid">PIX</span>
          </h2>

          <p className="text-chrome/50 font-mono text-xs text-center mb-6 uppercase">
            Escaneie o QR Code ou copie o codigo PIX
          </p>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-chrome border-2 border-dark-600">
              <img
                src={`data:image/png;base64,${pixData.qrCode}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
          </div>

          <div className="bg-dark-900 border-2 border-dark-600 p-4 mb-6">
            <div className="text-chrome/30 font-mono text-xs mb-2 uppercase">Codigo PIX Copia e Cola</div>
            <div className="text-chrome font-mono text-xs break-all mb-3">
              {pixData.copyPaste}
            </div>
            <button
              onClick={handleCopyPixCode}
              className="w-full py-3 bg-neon-pink text-void font-bold font-mono text-sm uppercase tracking-wider hover:bg-neon-acid transition-colors"
            >
              Copiar Codigo PIX
            </button>
          </div>

          <div className="bg-yellow-500/10 border-2 border-yellow-500/30 p-4 mb-6">
            <div className="text-yellow-400 font-mono text-xs text-center uppercase">
              Aguardando confirmacao do pagamento...
            </div>
            <div className="text-yellow-400/70 font-mono text-xs text-center mt-1 uppercase">
              A pagina sera atualizada automaticamente quando o pagamento for confirmado
            </div>
          </div>

          <div className="text-chrome/30 font-mono text-xs text-center uppercase">
            O pagamento PIX e processado instantaneamente
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingPayment) {
    return (
      <div className="fixed inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-dark-800 border-2 border-neon-red p-8 max-w-md w-full relative">
          <div className="text-chrome text-center">
            <div className="mb-4 text-6xl font-display text-neon-red animate-pulse">...</div>
            <div className="text-xl font-display tracking-wider uppercase">Verificando pagamento</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-void/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-dark-800 border-2 border-neon-red p-8 max-w-md w-full relative shadow-brutal-lg">
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-acid"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-acid"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-acid"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-acid"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-chrome/50 hover:text-neon-red transition-colors text-2xl font-display"
        >
          X
        </button>

        <h2 className="text-3xl font-display tracking-wider text-chrome mb-4 text-center uppercase">
          Realizar <span className="text-neon-red">Pagamento</span>
        </h2>

        <p className="text-chrome/50 font-mono text-xs text-center mb-8 uppercase">
          Selecione o metodo de pagamento
        </p>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setPaymentMethod('PIX')}
            className={`w-full p-6 border-2 transition-all ${
              paymentMethod === 'PIX'
                ? 'border-neon-red bg-neon-red/10 shadow-brutal-sm'
                : 'border-dark-600 hover:border-dark-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl font-display text-neon-acid">01</div>
              <div className="flex-1 text-left">
                <div className="text-chrome font-display tracking-wider text-lg uppercase">PIX</div>
                <div className="text-chrome/50 font-mono text-xs uppercase">
                  Pagamento instantaneo via QR Code
                </div>
              </div>
              {paymentMethod === 'PIX' && (
                <div className="text-neon-acid font-display text-2xl">OK</div>
              )}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('CREDIT_CARD')}
            className={`w-full p-6 border-2 transition-all ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-neon-red bg-neon-red/10'
                : 'border-dark-600 hover:border-dark-500'
            }`}
            disabled
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl font-display text-chrome/30">02</div>
              <div className="flex-1 text-left">
                <div className="text-chrome/30 font-display tracking-wider text-lg uppercase">
                  Cartao de Credito
                </div>
                <div className="text-chrome/20 font-mono text-xs uppercase">
                  Em breve
                </div>
              </div>
            </div>
          </button>
        </div>

        {createPaymentMutation.error && (
          <div className="mb-6 p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
            {createPaymentMutation.error.response?.data?.message ||
             createPaymentMutation.error.response?.data?.error ||
             'Erro ao criar pagamento. Tente novamente.'}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 bg-dark-800 text-chrome font-bold font-mono text-sm uppercase tracking-wider border-2 border-dark-600 hover:border-neon-red hover:text-neon-red transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={createPaymentMutation.isPending || paymentMethod === 'CREDIT_CARD'}
            className="flex-1 py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPaymentMutation.isPending ? 'Processando...' : 'Confirmar'}
          </button>
        </div>

        <div className="mt-6 text-chrome/30 font-mono text-xs text-center uppercase">
          Pagamento seguro processado pelo ASAAS
        </div>
      </div>
    </div>
  );
}
