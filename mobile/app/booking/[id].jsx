import { useLocalSearchParams } from 'expo-router';
import BookingDetailScreen from '../../src/screens/BookingDetailScreen';

export default function BookingDetail() {
  const { id } = useLocalSearchParams();

  return <BookingDetailScreen bookingId={id} />;
}
