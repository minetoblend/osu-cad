export function authenticate() {
  window.location.href =
    "http://10.25.120.192:3000/auth/login?redirect=" +
    encodeURIComponent(window.location.href);
}

export function authenticateWithPopup() {
  return new Promise<void>((resolve, reject) => {
    const width = 520;
    const height = 570;
    var left = screen.width / 2 - width / 2;
    var top = screen.height / 2 - height / 2;
    const opened = window.open(
      "http://10.25.120.192:3000/auth/login?redirect=" +
        encodeURIComponent("http://10.25.120.192:3000/authenticated"),
      "_blank",
      `location=yes,height=${height},width=${width},scrollbars=yes,status=yes,top=${top},left=${left}`
    );

    if (!opened) {
      reject();
    }

    window.addEventListener("message", function onMessage(ev) {
      if (ev.data === "authenticated") {
        window.removeEventListener("message", onMessage);
        resolve();
      }
    });

    opened?.addEventListener("close", () => {
      reject();
    });
  });
}
