import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

// Basic runtime error logging to aid debugging blank screens
window.addEventListener("error", (e) => console.error("Unhandled error:", e.error || e.message));
window.addEventListener("unhandledrejection", (e) => console.error("Unhandled promise rejection:", e.reason));

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
