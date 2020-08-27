import { INavbarItem } from "../providers/user.provider";

export const NAVBAR_ITEMS: { [key: string]: INavbarItem } = {
  PROJECTS: {
    title: "Projects",
    to: "/main/projects",
    icon: "mdi-apps",
  },
  ADMIN_PANEL: {
    title: "Admin panel",
    to: "/main/admin-panel",
    icon: "mdi-security",
  },
  SETTINGS: {
    title: "Settings",
    to: "/main/settings",
    icon: "mdi-cog-outline",
  },
};
