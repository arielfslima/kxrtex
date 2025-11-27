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
      setLocationError('Geolocalizacao nao e suportada pelo seu navegador');
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
        let errorMessage = 'Erro ao obter localizacao';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permissao de localizacao negada. Por favor, ative a localizacao no seu navegador.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localizacao indisponivel';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout ao obter localizacao';
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
        alert('A foto deve ter no maximo 50MB');
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
      formData.append('image', photo);

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
      alert('Aguarde a obtencao da localizacao');
      return;
    }

    if (type === 'checkin') {
      if (!photo) {
        alert('Selecione uma foto de comprovacao');
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
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);

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
          {isCheckIn ? (
            <>Check-<span className="text-neon-acid">in</span></>
          ) : (
            <>Check-<span className="text-neon-red">out</span></>
          )}
        </h2>

        <p className="text-chrome/50 font-mono text-xs text-center mb-8 uppercase">
          {isCheckIn
            ? 'Confirme sua presenca no local do evento'
            : 'Confirme a conclusao do evento'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Localizacao */}
          <div className="bg-dark-900 border-2 border-dark-600 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-chrome font-display tracking-wider uppercase flex items-center gap-2">
                <span className="text-neon-pink font-mono text-lg">01</span>
                Localizacao
              </div>
              {loadingLocation && (
                <div className="text-yellow-400 font-mono text-xs uppercase">Obtendo...</div>
              )}
            </div>

            {locationError ? (
              <div className="text-neon-red font-mono text-sm mb-2">{locationError}</div>
            ) : location ? (
              <div className="text-chrome/50 font-mono text-xs space-y-1">
                <div>LAT: {location.latitude.toFixed(6)}</div>
                <div>LON: {location.longitude.toFixed(6)}</div>
                {distance !== null && (
                  <div className={`font-bold mt-2 uppercase ${distance <= 500 ? 'text-neon-acid' : 'text-neon-red'}`}>
                    Distancia do evento: {Math.round(distance)}m
                    {distance > 500 && ' (maximo permitido: 500m)'}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-chrome/30 font-mono text-xs uppercase">Aguardando localizacao...</div>
            )}

            <button
              type="button"
              onClick={getLocation}
              className="w-full mt-3 py-2 bg-dark-700 border-2 border-dark-600 text-chrome font-mono text-xs uppercase tracking-wider hover:border-neon-red transition-colors"
              disabled={loadingLocation}
            >
              {loadingLocation ? 'Obtendo...' : 'Atualizar Localizacao'}
            </button>
          </div>

          {/* Foto (apenas para check-in) */}
          {isCheckIn && (
            <div className="bg-dark-900 border-2 border-dark-600 p-4">
              <div className="text-chrome font-display tracking-wider uppercase flex items-center gap-2 mb-3">
                <span className="text-neon-pink font-mono text-lg">02</span>
                Foto de Comprovacao
              </div>

              {photoPreview ? (
                <div className="relative">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover border-2 border-dark-600 mb-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      setPhotoPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-neon-red text-void px-3 py-1 font-mono text-xs uppercase hover:bg-chrome transition-colors"
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
                  <div className="w-full py-8 border-2 border-dashed border-dark-600 hover:border-neon-red transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div className="text-5xl font-display text-neon-red/50">+</div>
                    <span className="text-chrome/50 font-mono text-xs uppercase">Clique para tirar/selecionar foto</span>
                  </div>
                </label>
              )}

              <div className="text-chrome/30 font-mono text-xs mt-2 uppercase">
                Maximo 5MB. A foto sera usada como comprovacao de presenca.
              </div>
            </div>
          )}

          {/* Informacoes da janela de tempo */}
          {checkInStatus?.data?.janelas && (
            <div className="bg-neon-pink/10 border-2 border-neon-pink/30 p-4">
              <div className="text-neon-pink font-mono text-xs uppercase">
                {isCheckIn ? (
                  <>
                    <div className="font-bold mb-1">Janela de Check-in:</div>
                    <div>2h antes ate 1h apos o inicio do evento</div>
                  </>
                ) : (
                  <>
                    <div className="font-bold mb-1">Janela de Check-out:</div>
                    <div>Do inicio ate 1h apos o fim do evento</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Erro */}
          {mutation.error && (
            <div className="p-4 bg-neon-red/10 border-2 border-neon-red text-neon-red font-mono text-sm">
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
              className="flex-1 py-4 bg-dark-800 text-chrome font-bold font-mono text-sm uppercase tracking-wider border-2 border-dark-600 hover:border-neon-red hover:text-neon-red transition-all"
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
              className="flex-1 py-4 bg-neon-red text-void font-bold font-mono text-sm uppercase tracking-widest shadow-brutal hover:bg-neon-acid hover:shadow-brutal-acid transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending
                ? 'Processando...'
                : isCheckIn
                ? 'Confirmar'
                : 'Confirmar'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-chrome/30 font-mono text-xs text-center uppercase">
          {isCheckIn
            ? 'Apos o check-in, 50% do pagamento sera liberado automaticamente'
            : 'Apos o check-out, o pagamento restante sera liberado em 48h'}
        </div>
      </div>
    </div>
  );
}
