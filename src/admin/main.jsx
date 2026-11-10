import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/cairo/index.css";
import "@fontsource-variable/reem-kufi/index.css";
import "@fontsource/ibm-plex-mono/latin-600.css";
import "../styles/tokens.css";
import "../styles/admin.css";
import Admin from "./Admin.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Admin />
  </React.StrictMode>,
);
