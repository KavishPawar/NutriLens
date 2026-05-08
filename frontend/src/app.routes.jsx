import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import HomePage from "./features/product/pages/HomePage";
import Protected from "./features/components/Protected";
import DashboardLayout from "./features/components/DashboardLayout";
import ProductPage from "./features/product/pages/ProductPage";
import ProductHistory from "./features/product/pages/ProductHistory";
import ProfilePage from "./features/product/pages/ProfilePage";
import AdminPage from "./features/product/pages/AdminPage";
import PaymentPage from "./features/product/pages/PaymentPage";
import ErrorPage from "./features/components/ErrorPage";

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
    path: "/",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: "/product-detail",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
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
        ),
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
  {
    path: "/admin",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Protected>
            <AdminPage />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/payment",
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <Protected>
            <PaymentPage />
          </Protected>
        ),
      },
    ],
  },
  {
    path: "/error",
    element: <ErrorPage />,
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);
