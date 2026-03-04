import React from "react";
import { AuthProvider } from "./context/AuthProvider";
import { DeliveryProvider } from "./context/DeliveryContext";
import { CartProvider } from "./context/CartProvider";
import { ThemeProvider } from "./context/ThemeContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DeliveryProvider>
          <CartProvider>
            <AppRouter />
          </CartProvider>
        </DeliveryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
