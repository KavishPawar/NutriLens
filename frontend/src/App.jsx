import "./App.css";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { ProductProvider } from "./features/product/product.context.jsx";
import { AdminProvider } from "./features/product/admin.context.jsx";

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <ProductProvider>
          <RouterProvider router={router} />
        </ProductProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
