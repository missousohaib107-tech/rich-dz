import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/cairo/index.css";
import "@fontsource-variable/reem-kufi/index.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "./styles/tokens.css";
import "./styles/site.css";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
