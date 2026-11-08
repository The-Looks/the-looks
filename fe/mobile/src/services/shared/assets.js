// Metro needs static require paths. Files live in web-app/public and are watched by metro.config.js.
export const fontAssets = {
  head600: require('../../../../web-app/public/assets/fonts/BeVietnamPro-SemiBold.ttf'),
  head700: require('../../../../web-app/public/assets/fonts/BeVietnamPro-Bold.ttf'),
  body400: require('../../../../web-app/public/assets/fonts/BeVietnamPro-Regular.ttf'),
  body600: require('../../../../web-app/public/assets/fonts/BeVietnamPro-SemiBold.ttf'),
  body700: require('../../../../web-app/public/assets/fonts/BeVietnamPro-Bold.ttf'),
};

export const imageAssets = {
  logo: require('../../../../web-app/public/the-looks-logo.png'),
  quickPick: require('../../../../web-app/public/assets/home/quick-pick-editorial.png'),
  authWall: require('../../../../web-app/public/assets/auth/clothing-wall.png'),
  hangerStill: require('../../../../web-app/public/assets/animations/looksy-hanger.png'),
};
