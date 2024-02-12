import {Capacitor} from "@capacitor/core";

const mobile = Capacitor.getPlatform() === "android" || Capacitor.getPlatform() === "ios";

export function isMobile() {

  if ('userAgentData' in navigator) return (navigator.userAgentData as any).mobile
  return mobile
}