import { injectionToken } from "@osucad/framework";
export type IAudience = import("@osucad/multiplayer-client").IAudience;
export const IAudience = injectionToken<IAudience>("IAudience");
