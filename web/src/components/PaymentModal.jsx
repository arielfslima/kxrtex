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
    console.log('[PaymentModal] paymentStatus:', paymentStatus);
    if (paymentStatus?.data) {
      const payment = paymentStatus.data;
      console.log('[PaymentModal] Payment found:', {
        metodo: payment.metodo,
        status: payment.status,
        hasQrCode: !!payment.pixQrCode,
        hasCopyPaste: !!payment.pixCopyPaste
      });
      const isPending = payment.status === 'PENDENTE' || payment.status === 'PENDING';
      if (payment.metodo === 'PIX' && isPending && payment.pixQrCode) {
        console.log('[PaymentModal] Showing existing QR code');
        setPixData({
          qrCode: payment.pixQrCode,
          copyPaste: payment.pixCopyPaste
        });
        setShowPixCode(true);
        startPaymentPolling();
      } else {
        console.log('[PaymentModal] Not showing QR code:', {
          isPix: payment.metodo === 'PIX',
          isPending,
          hasQrCode: !!payment.pixQrCode
        });
      }
    } else {
      console.log('[PaymentModal] No payment data');
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
      alert('Código PIX copiado!');
    }
  };

  const handlePayment = () => {
    createPaymentMutation.mutate(paymentMethod);
  };

  if (showPixCode && pixData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-dark-800 border-2 border-red-vibrant rounded-2xl p-8 max-w-md w-full relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ×
          </button>

          <h2 className="text-3xl font-black text-white mb-4 text-center">
            Pagamento PIX
          </h2>

          <p className="text-gray-400 text-center mb-6">
            Escaneie o QR Code ou copie o código PIX
          </p>

          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white rounded-2xl">
              <img
                src={`data:image/png;base64,${pixData.qrCode}`}
                alt="QR Code PIX"
                className="w-64 h-64"
              />
            </div>
          </div>

          <div className="bg-dark-900 border border-dark-700 rounded-xl p-4 mb-6">
            <div className="text-gray-500 text-xs mb-2">Código PIX Copia e Cola</div>
            <div className="text-white text-sm break-all mb-3 font-mono">
              {pixData.copyPaste}
            </div>
            <button
              onClick={handleCopyPixCode}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors"
            >
              Copiar Código PIX
            </button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="text-yellow-400 text-sm text-center">
              Aguardando confirmação do pagamento...
            </div>
            <div className="text-yellow-400/70 text-xs text-center mt-1">
              A página será atualizada automaticamente quando o pagamento for confirmado
            </div>
          </div>

          <div className="text-gray-500 text-xs text-center">
            O pagamento PIX é processado instantaneamente
          </div>
        </div>
      </div>
    );
  }

  if (isLoadingPayment) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
        <div className="bg-dark-800 border-2 border-red-vibrant rounded-2xl p-8 max-w-md w-full relative">
          <div className="text-white text-center">
            <div className="mb-4 text-4xl">⏳</div>
            <div className="text-xl font-bold">Verificando pagamento...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-dark-800 border-2 border-red-vibrant rounded-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-2xl"
        >
          ×
        </button>

        <h2 className="text-3xl font-black text-white mb-4 text-center">
          Realizar Pagamento
        </h2>

        <p className="text-gray-400 text-center mb-8">
          Selecione o método de pagamento
        </p>

        <div className="space-y-4 mb-8">
          <button
            onClick={() => setPaymentMethod('PIX')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              paymentMethod === 'PIX'
                ? 'border-red-vibrant bg-red-vibrant/10'
                : 'border-dark-700 hover:border-dark-600'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">💳</div>
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-lg">PIX</div>
                <div className="text-gray-400 text-sm">
                  Pagamento instantâneo via QR Code
                </div>
              </div>
              {paymentMethod === 'PIX' && (
                <div className="text-red-vibrant text-2xl">✓</div>
              )}
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('CREDIT_CARD')}
            className={`w-full p-6 rounded-xl border-2 transition-all ${
              paymentMethod === 'CREDIT_CARD'
                ? 'border-red-vibrant bg-red-vibrant/10'
                : 'border-dark-700 hover:border-dark-600'
            }`}
            disabled
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl opacity-50">💳</div>
              <div className="flex-1 text-left">
                <div className="text-white font-bold text-lg opacity-50">
                  Cartão de Crédito
                </div>
                <div className="text-gray-400 text-sm">
                  Em breve
                </div>
              </div>
            </div>
          </button>
        </div>

        {createPaymentMutation.error && (
          <div className="mb-6 p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
            {createPaymentMutation.error.response?.data?.message ||
             createPaymentMutation.error.response?.data?.error ||
             'Erro ao criar pagamento. Tente novamente.'}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 border-2 border-dark-700 text-gray-300 font-bold rounded-xl hover:border-dark-600 hover:text-white transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handlePayment}
            disabled={createPaymentMutation.isPending || paymentMethod === 'CREDIT_CARD'}
            className="flex-1 py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {createPaymentMutation.isPending ? 'Processando...' : 'Confirmar Pagamento'}
          </button>
        </div>

        <div className="mt-6 text-gray-500 text-xs text-center">
          Pagamento seguro processado pelo ASAAS
        </div>
      </div>
    </div>
  );
}
