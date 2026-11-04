// Metro needs static require paths. Files live only in web-app/public and are watched by metro.config.js.
export const fontAssets = {
  head600: require('../../../../web-app/public/assets/fonts/head-600.ttf'),
  head700: require('../../../../web-app/public/assets/fonts/head-700.ttf'),
  body400: require('../../../../web-app/public/assets/fonts/body-400.ttf'),
  body600: require('../../../../web-app/public/assets/fonts/body-600.ttf'),
  body700: require('../../../../web-app/public/assets/fonts/body-700.ttf'),
};

export const imageAssets = {
  logo: require('../../../../web-app/public/the-looks-logo.png'),
  quickPick: require('../../../../web-app/public/assets/home/quick-pick-editorial.png'),
  authWall: require('../../../../web-app/public/assets/auth/clothing-wall.png'),
  hangerStill: require('../../../../web-app/public/assets/animations/looksy-hanger.png'),
};
