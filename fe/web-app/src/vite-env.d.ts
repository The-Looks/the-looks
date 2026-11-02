/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Danh sách service giả lập bằng MSW, cách nhau bởi dấu phẩy: auth,wardrobe,outfit,voting */
  readonly VITE_MOCK_SERVICES?: string;
  /** Canonical web origin used for local Google OAuth; must match WEB_ORIGIN and the Google redirect URI. */
  readonly VITE_GOOGLE_ORIGIN?: string;
}
