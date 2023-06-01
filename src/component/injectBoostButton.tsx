import React from "react";
import { createRoot } from "react-dom/client";

import { BoostButton } from "./boostButton";

export const injectBoostButton = (lnurl: string) => {
  if (document.querySelector("body #alby-shadow")) {
    return;
  }
  const body = document.querySelector("body");
  const shadowWrapper = document.createElement("div");
  const app = document.createElement("div");

  shadowWrapper.id = "alby-shadow";
  app.id = "alby-root";
  app.style.position = "fixed";
  app.style.zIndex = "1000000000";
  app.style.bottom = "20px";
  app.style.right = "20px";

  if (body && !window.frameElement) {
    body.prepend(shadowWrapper);
    const shadow = shadowWrapper.attachShadow({ mode: "open" });
    shadow.appendChild(app);
  }

  const root = createRoot(app);

  root.render(<BoostButton lnurl={lnurl} />);
}