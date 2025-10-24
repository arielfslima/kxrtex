import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../src/constants/colors';

export default function Bookings() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Bookings</Text>
      <Text style={styles.subtitle}>Lista de bookings - será implementada</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
