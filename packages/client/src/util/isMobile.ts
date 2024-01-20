import {Capacitor} from "@capacitor/core";

const mobile = Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios";

export function isMobile() {
  return mobile;
}