module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  apps: {
    'ios.app': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/WeldingApp.app',
      build: 'xcodebuild -workspace ios/WeldingApp.xcworkspace -scheme WeldingApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.app': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
    },
  },
  devices: {
    'ios.simulator': {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    'android.emulator': {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_4_API_30',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'ios.simulator',
      app: 'ios.app',
    },
    'android.emu.debug': {
      device: 'android.emulator',
      app: 'android.app',
    },
  },
  artifacts: {
    plugins: {
      screenshot: {
        enabled: true,
        shouldTakeAutomaticSnapshots: true,
        keepOnlyFailedTestsArtifacts: true,
      },
      video: {
        enabled: true,
        keepOnlyFailedTestsArtifacts: true,
      },
    },
  },
};
