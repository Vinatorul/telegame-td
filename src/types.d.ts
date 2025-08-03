interface TelegramWebApp {
  ready(): void;
  requestFullscreen(): void;
  initData: string;
  viewportHeight: number;
  viewportStableWidth: number;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
