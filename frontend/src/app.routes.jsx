import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import HomePage from "./features/product/pages/HomePage";
import Protected from "./features/components/Protected";
import DashboardLayout from "./features/components/DashboardLayout";
import ProductPage from "./features/product/pages/ProductPage";
import ProductHistory from "./features/product/pages/ProductHistory";
import ProfilePage from "./features/product/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    // Dashboard shell — renders sidebar + wraps child routes via <Outlet>
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        // element: <Protected><HomePage /></Protected>
        element: <HomePage />,
      },
    ],
  },
  {
    // Dashboard shell — renders sidebar + wraps child routes via <Outlet>
    path: "/product-detail",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        // element: <Protected><HomePage /></Protected>
        element: <ProductPage />,
      },
    ],
  },
  {
    path: "/product-history",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Protected>
            <ProductHistory />
          </Protected>
          )
      },
    ],
  },
  {
    path: "/profile",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <ProfilePage />,
      },
    ],
  },
]);
