import { Provider } from "react-redux";
import { RouterProvider } from "react-router";
import router from "./router";
import store from "./app/store";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;
