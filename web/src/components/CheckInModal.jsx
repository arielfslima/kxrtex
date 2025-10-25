import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function CheckInModal({ bookingId, type, onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const { data: checkInStatus } = useQuery({
    queryKey: ['checkin-status', bookingId],
    queryFn: async () => {
      const response = await api.get(`/checkin/booking/${bookingId}/status`);
      return response.data;
    },
    retry: false
  });

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setLoadingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador');
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Erro ao obter localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Por favor, ative a localização no seu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localização';
            break;
        }
        setLocationError(errorMessage);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('A foto deve ter no máximo 50MB');
        return;
      }

      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const checkInMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('latitude', location.latitude);
      formData.append('longitude', location.longitude);
      formData.append('image', photo); // Mudado de 'photo' para 'image' para compatibilidade com o middleware

      const endpoint = type === 'checkin'
        ? `/checkin/booking/${bookingId}/checkin`
        : `/checkin/booking/${bookingId}/checkout`;

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['checkin-status', bookingId]);
      onSuccess?.();
    }
  });

  const checkOutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/checkin/${bookingId}/checkout`, {
        latitude: location.latitude,
        longitude: location.longitude
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
      queryClient.invalidateQueries(['checkin-status', bookingId]);
      onSuccess?.();
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!location) {
      alert('Aguarde a obtenção da localização');
      return;
    }

    if (type === 'checkin') {
      if (!photo) {
        alert('Selecione uma foto de comprovação');
        return;
      }
      checkInMutation.mutate();
    } else {
      checkOutMutation.mutate();
    }
  };

  const isCheckIn = type === 'checkin';
  const mutation = isCheckIn ? checkInMutation : checkOutMutation;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const distance = location && checkInStatus?.data?.coordenadasEvento
    ? calculateDistance(
        location.latitude,
        location.longitude,
        checkInStatus.data.coordenadasEvento.latitude,
        checkInStatus.data.coordenadasEvento.longitude
      )
    : null;

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
          {isCheckIn ? 'Check-in no Evento' : 'Check-out do Evento'}
        </h2>

        <p className="text-gray-400 text-center mb-8">
          {isCheckIn
            ? 'Confirme sua presença no local do evento'
            : 'Confirme a conclusão do evento'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Localização */}
          <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-white font-bold flex items-center gap-2">
                <span className="text-xl">📍</span>
                Localização
              </div>
              {loadingLocation && (
                <div className="text-yellow-400 text-sm">Obtendo...</div>
              )}
            </div>

            {locationError ? (
              <div className="text-red-vibrant text-sm mb-2">{locationError}</div>
            ) : location ? (
              <div className="text-gray-400 text-sm space-y-1">
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lon: {location.longitude.toFixed(6)}</div>
                {distance !== null && (
                  <div className={`font-bold mt-2 ${distance <= 500 ? 'text-green-400' : 'text-red-vibrant'}`}>
                    Distância do evento: {Math.round(distance)}m
                    {distance > 500 && ' (máximo permitido: 500m)'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Aguardando localização...</div>
            )}

            <button
              type="button"
              onClick={getLocation}
              className="w-full mt-3 py-2 bg-dark-700 text-gray-300 text-sm rounded-lg hover:bg-dark-600 transition-colors"
              disabled={loadingLocation}
            >
              {loadingLocation ? 'Obtendo...' : 'Atualizar Localização'}
            </button>
          </div>

          {/* Foto (apenas para check-in) */}
          {isCheckIn && (
            <div className="bg-dark-900 border border-dark-700 rounded-xl p-4">
              <div className="text-white font-bold flex items-center gap-2 mb-3">
                <span className="text-xl">📸</span>
                Foto de Comprovação
              </div>

              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-vibrant text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <div className="w-full py-8 border-2 border-dashed border-dark-700 rounded-lg hover:border-red-vibrant transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <span className="text-4xl">📷</span>
                    <span className="text-gray-400 text-sm">Clique para tirar/selecionar foto</span>
                  </div>
                </label>
              )}

              <div className="text-gray-500 text-xs mt-2">
                Máximo 5MB. A foto será usada como comprovação de presença.
              </div>
            </div>
          )}

          {/* Informações da janela de tempo */}
          {checkInStatus?.data?.janelas && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="text-blue-400 text-sm">
                {isCheckIn ? (
                  <>
                    <div className="font-bold mb-1">Janela de Check-in:</div>
                    <div>2h antes até 1h após o início do evento</div>
                  </>
                ) : (
                  <>
                    <div className="font-bold mb-1">Janela de Check-out:</div>
                    <div>Do início até 1h após o fim do evento</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Erro */}
          {mutation.error && (
            <div className="p-4 bg-red-vibrant/10 border border-red-vibrant/50 rounded-xl text-red-vibrant text-sm">
              {mutation.error.response?.data?.message ||
               mutation.error.response?.data?.error ||
               `Erro ao realizar ${isCheckIn ? 'check-in' : 'check-out'}. Tente novamente.`}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-dark-700 text-gray-300 font-bold rounded-xl hover:border-dark-600 hover:text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                mutation.isPending ||
                !location ||
                loadingLocation ||
                (isCheckIn && !photo) ||
                (distance !== null && distance > 500)
              }
              className="flex-1 py-4 bg-gradient-to-r from-red-vibrant to-pink-600 text-white font-bold rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-red-vibrant/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {mutation.isPending
                ? 'Processando...'
                : isCheckIn
                ? 'Confirmar Check-in'
                : 'Confirmar Check-out'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-gray-500 text-xs text-center">
          {isCheckIn
            ? 'Após o check-in, 50% do pagamento será liberado automaticamente'
            : 'Após o check-out, o pagamento restante será liberado em 48h'}
        </div>
      </div>
    </div>
  );
}
