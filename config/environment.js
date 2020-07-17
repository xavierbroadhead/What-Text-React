var environments = {
  staging: {
    FIREBASE_API_KEY: '',
    FIREBASE_AUTH_DOMAIN: 'what-textrn.firebaseapp.com',
    FIREBASE_DATABASE_URL: 'https://what-textrn.firebaseio.com',
    FIREBASE_PROJECT_ID: 'what-textrn',
    FIREBASE_STORAGE_BUCKET: 'what-textrn.appspot.com',
    FIREBASE_MESSAGING_SENDER_ID: '1085894953323',
    GOOGLE_CLOUD_VISION_API_KEY: ''
  },
  production: {
    // Warning: This file still gets included in your native binary and is not a secure way to store secrets if you build for the app stores. Details: https://github.com/expo/expo/issues/83
  }
};

function getReleaseChannel() {
  let releaseChannel = Expo.Constants.manifest.releaseChannel;
  if (releaseChannel === undefined) {
    return 'staging';
  } else if (releaseChannel === 'staging') {
    return 'staging';
  } else {
    return 'staging';
  }
}
function getEnvironment(env) {
  console.log('Release Channel: ', getReleaseChannel());
  return environments[env];
}
var Environment = getEnvironment(getReleaseChannel());
export default Environment;
