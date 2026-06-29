import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, LinearGradient, Stop } from 'react-native-svg';

interface AfterlyLogoProps {
  size?: number;
  showText?: boolean;
}

export function AfterlyLogo({ size = 32, showText = true }: AfterlyLogoProps) {
  const textSize = size * 0.55;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <LinearGradient
          id="grad"
          x1="0"
          y1="0"
          x2="32"
          y2="0"
        >
          <Stop offset="0%" stopColor="#C9A050" />
          <Stop offset="100%" stopColor="#5ABFCF" />
        </LinearGradient>

        <Path
          d="M8 26 L8 6 L10 6 L10 12 L22 12 L22 6 L24 6 L24 26 L22 26 L22 20 L10 20 L10 26 Z"
          stroke="#C9A050"
          strokeWidth="2"
          fill="none"
        />

        <Path
          d="M12 14 L20 14"
          stroke="url(#grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </Svg>

      {showText && (
        <Text style={[styles.text, { fontSize: textSize, marginLeft: size * 0.3 }]}>
          Afterly
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontWeight: '500',
    color: '#F0EEE8',
    letterSpacing: -0.5,
  },
});