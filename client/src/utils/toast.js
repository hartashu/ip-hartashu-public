import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

const defaultOptions = {
  duration: 3000,
  newWindow: true,
  close: true,
  gravity: "bottom", // 'top' or 'bottom'
  position: "right", // 'left', 'center' or 'right'
  stopOnFocus: true, // Prevents dismissing of toast on hover
};

const showToast = (message, type = "success") => {
  let options = {
    ...defaultOptions,
    text: message,
  };

  if (type === "success") {
    options.style = {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    };
  } else if (type === "error") {
    options.style = {
      background: "linear-gradient(to right, #ff5f6d, #ffc371)",
    };
  } else if (type === "info") {
    options.style = {
      background: "linear-gradient(to right, #2193b0, #6dd5ed)",
    };
  }

  Toastify(options).showToast();
};

export default showToast;
