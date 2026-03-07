const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer = {
  ...config.transformer,
  transformIgnorePatterns: [
    'node_modules/(?!(expo|expo-router|expo-status-bar|expo-font|expo-asset|expo-modules-core|@expo|react-native|@react-native(?!.*community)|react-native-screens)/)',
  ],
};

module.exports = config;
