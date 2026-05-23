import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

const ctx = require.context('./app');
export const unstable_Root = ExpoRoot({ ctx });

registerRootComponent(unstable_Root);
