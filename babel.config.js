module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Este plugin evita que la aplicación se cierre de golpe
      'react-native-reanimated/plugin',
    ],
  };
};