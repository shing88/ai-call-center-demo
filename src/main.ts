import { renderApp } from "./app.js";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("Application root #app was not found.");
}

root.innerHTML = renderApp();
