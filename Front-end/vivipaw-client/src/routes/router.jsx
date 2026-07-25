import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    path: "/",
    errorElement: <NotFound />,
    children: [
      { element: <Home />, index: true },
      { element: <Forbidden />, path: "403" },
      { element: <NotFound />, path: "*" },
    ],
  },
]);