import { createBrowserRouter } from "react-router";
import LoginPage from "../pages/LoginPage";
import SocketClient from "../pages/SocketClient.jsx";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <SocketClient />,
  },
]);

export default router;
