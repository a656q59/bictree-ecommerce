import { createBrowserRouter } from "react-router-dom";

import { SiteLayout } from "../../components/layout/SiteLayout.tsx";
import { HomePage } from "../../pages/HomePage.tsx";
import { CartPage } from "../../pages/CartPage.tsx";
import { NotFoundPage } from "../../pages/NotFoundPage.tsx";
import { OrderConfirmationPage } from "../../pages/OrderConfirmationPage.tsx";
import { ProductDetailPage } from "../../pages/ProductDetailPage.tsx";
import { ProductListPage } from "../../pages/ProductListPage.tsx";
import { LoginPage } from "../../pages/LoginPage.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "products",
        element: <ProductListPage />,
      },
      {
        path: "products/:slug",
        element: <ProductDetailPage />,
      },
      {
        path: "cart",
        element: <CartPage />,
      },
      {
        path: "orders/:orderId",
        element: <OrderConfirmationPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
