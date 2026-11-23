import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerAppWorker } from "./lib/registerAppWorker";

const root = document.getElementById("root");
if (root) createRoot(root).render(<App />);
void registerAppWorker().catch(error => console.warn("Offline support unavailable", error));
