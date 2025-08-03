interface TelegramWebApp {
  ready(): void;
  expand(): void;
  viewportHeight: number;
  viewportStableWidth: number;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
