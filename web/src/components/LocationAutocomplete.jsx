import { useEffect, useRef, useState } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA_50_Ix2-aFOjO8yP-NL_Fn-FRz26aQZU';

export default function LocationAutocomplete({ value, onChange, placeholder = "Digite o endereço do evento" }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Carregar Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=pt-BR&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    // Inicializar autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'br' },
      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      types: ['geocode'], // Aceita endereços e locais
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();

      if (!place.geometry) {
        console.warn('No geometry for selected place');
        return;
      }

      const { geometry, address_components, formatted_address } = place;
      const { lat, lng } = geometry.location;

      // Extrair componentes do endereço
      const getAddressComponent = (type) => {
        const component = address_components?.find(comp => comp.types.includes(type));
        return component ? component.long_name : '';
      };

      const getAddressComponentShort = (type) => {
        const component = address_components?.find(comp => comp.types.includes(type));
        return component ? component.short_name : '';
      };

      const streetNumber = getAddressComponent('street_number');
      const route = getAddressComponent('route');
      const city = getAddressComponent('administrative_area_level_2') || getAddressComponent('locality');
      const state = getAddressComponentShort('administrative_area_level_1');
      const postalCode = getAddressComponent('postal_code');

      const endereco = [route, streetNumber].filter(Boolean).join(', ');

      // Enviar todos os dados estruturados
      onChange({
        local: formatted_address,
        localEndereco: endereco,
        localCidade: city,
        localEstado: state,
        localCEP: postalCode,
        localLatitude: lat(),
        localLongitude: lng(),
      });

      console.log('Location selected:', {
        formatted_address,
        endereco,
        city,
        state,
        postalCode,
        lat: lat(),
        lng: lng(),
      });
    });

    autocompleteRef.current = autocomplete;

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        required
        className="w-full px-4 py-3 bg-dark-900 border border-dark-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-red-vibrant transition-colors"
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
