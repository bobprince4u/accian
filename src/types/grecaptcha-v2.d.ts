export {};

declare global {
  interface Window {
    grecaptcha?: {
      render(
        container: string | HTMLElement,
        parameters?: {
          sitekey: string;
          theme?: "light" | "dark";
          size?: "normal" | "compact" | "invisible";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ): number;

      getResponse(widgetId?: number): string;
      reset(widgetId?: number): void;
    };
  }
}
