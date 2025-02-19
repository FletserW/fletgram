const { getDefaultConfig } = require('expo/metro-config');

module.exports = (async () => {
  const defaultConfig = await getDefaultConfig(__dirname);

  return {
    ...defaultConfig,
    resolver: {
      assetExts: [...defaultConfig.resolver.assetExts, 'db', 'mp4', 'jpg', 'jpeg', 'png', 'ttf', 'wav', 'mp3', 'json'],
      sourceExts: [...defaultConfig.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'],
    },
    transformer: {
      ...defaultConfig.transformer,
    },
  };
})();
