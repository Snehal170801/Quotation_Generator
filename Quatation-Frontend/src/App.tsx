// src/App.tsx

import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { router } from "./routes/index";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontWeight: 500,
            color: "#1a1a1f",
            background: "#ffffff",
            border: "1px solid var(--color-border-light)",
            borderRadius: "12px",
            boxShadow: "var(--shadow-lg)",
            padding: "12px 14px",
            maxWidth: "360px",
          },
          success: {
            iconTheme: { primary: "#12a366", secondary: "#ffffff" },
            style: { borderLeft: "3px solid #12a366" },
          },
          error: {
            iconTheme: { primary: "#e03333", secondary: "#ffffff" },
            style: { borderLeft: "3px solid #e03333" },
          },
          loading: {
            iconTheme: { primary: "#7045f7", secondary: "#ffffff" },
          },
        }}
      />
    </>
  );
}
