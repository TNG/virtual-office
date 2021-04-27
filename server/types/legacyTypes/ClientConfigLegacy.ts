export interface ClientConfigLegacy {
  backgroundUrl?: string;
  viewMode: "list" | "grid";
  theme: "dark" | "light";
  timezone?: string;
  sessionStartMinutesOffset: number;
  title?: string;
  logoUrl?: string;
  faviconUrl?: string;
  hideEndedSessions?: boolean;
}
