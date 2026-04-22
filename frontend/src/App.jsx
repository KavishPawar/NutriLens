import "./App.css";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { ProductProvider } from "./features/product/product.context.jsx";
import { useEffect } from "react";
import { useAuthHook } from "./features/auth/hooks/useAuthHook.jsx";

function App() {

  return (
    <AuthProvider>
      <ProductProvider>
        <RouterProvider router={router} />
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;
