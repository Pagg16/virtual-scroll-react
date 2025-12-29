import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import ScrollInElement from "./ScrollInElement";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ScrollInElement />
  </StrictMode>
);
