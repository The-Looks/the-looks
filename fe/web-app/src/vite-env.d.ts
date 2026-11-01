/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Danh sách service giả lập bằng MSW, cách nhau bởi dấu phẩy: identity,wardrobe,outfit,voting */
  readonly VITE_MOCK_SERVICES?: string;
}
