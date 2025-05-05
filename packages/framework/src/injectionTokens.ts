import type { InjectionToken } from "./di/DependencyContainer";
import type { GameHost } from "./platform";

export const GAME_HOST: InjectionToken<GameHost> = Symbol("GameHost");
