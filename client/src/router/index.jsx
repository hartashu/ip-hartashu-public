import { createBrowserRouter, redirect } from "react-router";
import LoginPage from "../pages/LoginPage";
import SocketClient from "../pages/SocketClient.jsx";
import RegisterPage from "../pages/RegisterPage.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    loader: async () => {
      if (localStorage.getItem("access_token")) {
        return redirect("/");
      }
    },
    element: <LoginPage />,
  },
  {
    path: "/register",
    loader: async () => {
      if (localStorage.getItem("access_token")) {
        return redirect("/");
      }
    },
    element: <RegisterPage />,
  },
  {
    path: "/",
    loader: async () => {
      if (!localStorage.getItem("access_token")) {
        return redirect("/login");
      }
    },
    element: <SocketClient />,
  },
]);

export default router;
