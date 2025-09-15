export type SiteConfig = {
  name: string;
  description?: string;
  primaryColor?: string;
};

export const defaultSiteConfig: SiteConfig = {
  name: "Acme Landing",
  description: "Landing genérica",
  primaryColor: "#16a34a"
};
