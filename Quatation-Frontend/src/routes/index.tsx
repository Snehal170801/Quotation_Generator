import { createBrowserRouter, Navigate } from "react-router-dom";
import RootLayout from "../components/layout/RootLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminRoute from "../components/layout/AdminRoute";
import AdminPanel from "../pages/AdminPanel/index";
import SalesPanel from "../pages/SalesPanel";
import SettingsPage from "../pages/Settings/index";
import OrdersPage from "../pages/Orders/index";
import LoginPage from "../pages/Login/index";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          { index: true, element: <Navigate to="/sales" replace /> },
          { path: "admin", element: <AdminRoute><AdminPanel /></AdminRoute> },
          { path: "sales", element: <SalesPanel /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);
