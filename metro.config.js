const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fuerza a Metro a resolver Zustand en su build CommonJS,
// evitando el import.meta.env de su build ESM (que rompe en Expo Web).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.includes("zustand")) {
    const result = require.resolve(moduleName);
    return context.resolveRequest(context, result, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
