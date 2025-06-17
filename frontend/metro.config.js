const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Force React Native FlatList instead of gesture-handler version
config.resolver.alias = {
  ...config.resolver.alias,
};

// Disable any FlatList transformations from gesture-handler
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;