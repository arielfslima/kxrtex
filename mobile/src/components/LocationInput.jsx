import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { COLORS } from '../constants/colors';

// API Key do Google Maps - Places API
// TODO: Mover para variável de ambiente em produção
const GOOGLE_MAPS_API_KEY = 'AIzaSyA_50_Ix2-aFOjO8yP-NL_Fn-FRz26aQZU';

const LocationInput = ({ value, onChange, error }) => {
  const [coordinates, setCoordinates] = useState(null);
  const autocompleteRef = useRef(null);

  const handlePlaceSelect = (data, details = null) => {
    console.log('Place selected:', data);
    console.log('Place details:', details);

    if (!details) return;

    const { geometry, address_components, formatted_address } = details;
    const { lat, lng } = geometry.location;

    // Extrair componentes do endereço
    const getAddressComponent = (type) => {
      const component = address_components.find(comp => comp.types.includes(type));
      return component ? component.long_name : '';
    };

    const getAddressComponentShort = (type) => {
      const component = address_components.find(comp => comp.types.includes(type));
      return component ? component.short_name : '';
    };

    const streetNumber = getAddressComponent('street_number');
    const route = getAddressComponent('route');
    const city = getAddressComponent('administrative_area_level_2') || getAddressComponent('locality');
    const state = getAddressComponentShort('administrative_area_level_1');
    const postalCode = getAddressComponent('postal_code');

    const endereco = [route, streetNumber].filter(Boolean).join(', ');

    // Salva coordenadas para exibição
    setCoordinates({ latitude: lat, longitude: lng });

    // Atualiza o formulário com todos os dados estruturados
    onChange({
      local: formatted_address,
      localEndereco: endereco,
      localCidade: city,
      localEstado: state,
      localCEP: postalCode,
      localLatitude: lat,
      localLongitude: lng,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Local do Evento *</Text>

      <GooglePlacesAutocomplete
        ref={autocompleteRef}
        placeholder="Digite o endereço do evento"
        onPress={handlePlaceSelect}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'pt-BR',
          components: 'country:br',
        }}
        fetchDetails={true}
        enablePoweredByContainer={false}
        debounce={400}
        minLength={2}
        keepResultsAfterBlur={false}
        listViewDisplayed="auto"
        renderDescription={(row) => row.description}
        onFail={(error) => {
          console.error('GooglePlacesAutocomplete Error:', error);
          Alert.alert('Erro', 'Não foi possível buscar endereços. Verifique sua conexão.');
        }}
        requestUrl={{
          useOnPlatform: 'all',
          url: 'https://maps.googleapis.com/maps/api',
        }}
        styles={{
          textInputContainer: styles.autocompleteContainer,
          textInput: [styles.input, error && styles.inputError],
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          poweredContainer: { display: 'none' },
        }}
        textInputProps={{
          placeholderTextColor: COLORS.textTertiary,
          autoCapitalize: 'words',
          autoCorrect: false,
        }}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      {coordinates && (
        <View style={styles.coordsBox}>
          <Text style={styles.coordsText}>
            ✓ Localização selecionada: {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  autocompleteContainer: {
    flex: 0,
    zIndex: 2,
  },
  input: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    height: 50,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  listView: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    maxHeight: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
  row: {
    backgroundColor: COLORS.card,
    padding: 14,
    minHeight: 44,
  },
  description: {
    fontSize: 14,
    color: COLORS.text,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    marginTop: 4,
  },
  coordsBox: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  coordsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default LocationInput;
