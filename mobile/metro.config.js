const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuração para resolver o erro de import.meta
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
