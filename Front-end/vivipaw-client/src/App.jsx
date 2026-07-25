import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { router } from "./routes/router";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "14px",
              background: "#1E293B",
              color: "#fff",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#0EA5A4", secondary: "#fff" } },
            error: { iconTheme: { primary: "#F43F5E", secondary: "#fff" } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}