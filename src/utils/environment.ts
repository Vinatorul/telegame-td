export const isTelegramWebApp =
  typeof window !== 'undefined' &&
  window.Telegram &&
  window.Telegram.WebApp &&
  window.Telegram.WebApp.initData &&
  window.Telegram.WebApp.initData.length > 0;
