interface TelegramWebApp {
  ready(): void;
  viewportHeight: number;
  viewportStableWidth: number;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
