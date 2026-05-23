import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function ExploreScreen() {
  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg.primary }]}>
      <Text style={styles.text}>Explore Screen - Coming Soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text.primary,
    fontSize: 18,
  },
});