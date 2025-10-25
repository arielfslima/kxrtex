import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { COLORS } from '../constants/colors';

const CheckInModal = ({ visible, onClose, bookingId, type = 'checkin' }) => {
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const mutation = useMutation({
    mutationFn: async ({ bookingId, latitude, longitude, photo }) => {
      const formData = new FormData();
      formData.append('latitude', parseFloat(latitude));
      formData.append('longitude', parseFloat(longitude));

      if (photo) {
        const filename = photo.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const fileType = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri: photo.uri,
          name: filename,
          type: fileType,
        });
      }

      const endpoint =
        type === 'checkin'
          ? `/checkin/booking/${bookingId}/checkin`
          : `/checkin/booking/${bookingId}/checkout`;

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['booking', bookingId]);
      queryClient.invalidateQueries(['bookings']);
      Alert.alert(
        'Sucesso',
        data.message || `${type === 'checkin' ? 'Check-in' : 'Check-out'} realizado!`,
        [{ text: 'OK', onPress: onClose }]
      );
    },
    onError: (error) => {
      Alert.alert(
        'Erro',
        error.response?.data?.message ||
          `Erro ao realizar ${type === 'checkin' ? 'check-in' : 'check-out'}`
      );
    },
  });

  useEffect(() => {
    if (visible) {
      getLocation();
    } else {
      // Reset state when modal closes
      setLocation(null);
      setPhoto(null);
    }
  }, [visible]);

  const getLocation = async () => {
    try {
      setLoadingLocation(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos acessar sua localização para o check-in'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    } finally {
      setLoadingLocation(false);
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos acessar sua câmera para tirar a foto'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Erro ao tirar foto');
    }
  };

  const selectPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão Negada',
          'Precisamos acessar suas fotos'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Erro', 'Erro ao selecionar foto');
    }
  };

  const handlePhotoSelection = () => {
    Alert.alert('Selecionar Foto', 'Escolha de onde deseja selecionar a foto', [
      { text: 'Câmera', onPress: takePhoto },
      { text: 'Galeria', onPress: selectPhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSubmit = () => {
    if (!location) {
      Alert.alert('Atenção', 'Obtendo localização...');
      return;
    }

    if (type === 'checkin' && !photo) {
      Alert.alert('Atenção', 'A foto é obrigatória para check-in');
      return;
    }

    mutation.mutate({
      bookingId,
      latitude: location.latitude,
      longitude: location.longitude,
      photo,
    });
  };

  const isReady = location && (type === 'checkout' || photo);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {type === 'checkin' ? 'Check-in' : 'Check-out'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Localização</Text>
            {loadingLocation ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={COLORS.accent} />
                <Text style={styles.loadingText}>Obtendo localização...</Text>
              </View>
            ) : location ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Lat: {location.latitude.toFixed(6)}
                </Text>
                <Text style={styles.infoText}>
                  Lon: {location.longitude.toFixed(6)}
                </Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.retryButton} onPress={getLocation}>
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Photo */}
          {type === 'checkin' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                📸 Foto {type === 'checkin' && '(obrigatório)'}
              </Text>
              {photo ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={handlePhotoSelection}
                  >
                    <Text style={styles.changePhotoButtonText}>Alterar Foto</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={handlePhotoSelection}
                >
                  <Text style={styles.addPhotoButtonIcon}>📷</Text>
                  <Text style={styles.addPhotoButtonText}>Adicionar Foto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsIcon}>ℹ️</Text>
            <Text style={styles.instructionsText}>
              {type === 'checkin'
                ? 'Tire uma foto no local do evento para confirmar sua presença.'
                : 'Confirme que você está finalizando o evento.'}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isReady || mutation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isReady || mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color={COLORS.text} />
            ) : (
              <Text style={styles.submitButtonText}>
                Confirmar {type === 'checkin' ? 'Check-in' : 'Check-out'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 32,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoBox: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: 'monospace',
  },
  retryButton: {
    padding: 16,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  photoContainer: {
    gap: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  changePhotoButton: {
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    alignItems: 'center',
  },
  changePhotoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
  },
  addPhotoButton: {
    padding: 24,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  addPhotoButtonIcon: {
    fontSize: 32,
  },
  addPhotoButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  instructionsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  instructionsIcon: {
    fontSize: 20,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    padding: 18,
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default CheckInModal;
