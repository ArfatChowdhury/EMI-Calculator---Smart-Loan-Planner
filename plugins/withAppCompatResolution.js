const { withProjectBuildGradle, withAppBuildGradle } = require('@expo/config-plugins');

const withAppCompatResolution = (config) => {
  // 1. Root build.gradle force resolution
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('androidx.appcompat:appcompat:1.6.1')) {
      return config;
    }
    
    const forceResolution = `
allprojects {
    configurations.all {
        resolutionStrategy {
            force "androidx.appcompat:appcompat:1.6.1"
        }
    }
}
`;
    config.modResults.contents += forceResolution;
    return config;
  });

  // 2. App build.gradle explicit implementation (Removed because it caused a syntax error)
  // config = withAppBuildGradle(config, (config) => { ... });

  return config;
};

module.exports = withAppCompatResolution;
