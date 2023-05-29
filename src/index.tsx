import React from 'react';
import { createRoot } from "react-dom/client";

import BoostButton from "./button";

function injectBoostButton(lnurl) {
  if (document.querySelector("body #alby-shadow")) {
    return;
  }
  const body = document.querySelector("body");
  const shadowWrapper = document.createElement("div");
  const app = document.createElement("div");

  shadowWrapper.id = "alby-shadow";
  app.id = "alby-root";

  if (body && !window.frameElement) {
    body.prepend(shadowWrapper);
    const shadow = shadowWrapper.attachShadow({ mode: "open" });
    shadow.appendChild(app);
  }

  const root = createRoot(app);

  root.render(<BoostButton lnurl={lnurl} />);
}

export default injectBoostButton;
