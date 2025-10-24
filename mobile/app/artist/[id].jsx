import { useLocalSearchParams } from 'expo-router';
import ArtistDetailScreen from '../../src/screens/ArtistDetailScreen';

export default function ArtistDetail() {
  const { id } = useLocalSearchParams();

  return <ArtistDetailScreen artistId={id} />;
}
