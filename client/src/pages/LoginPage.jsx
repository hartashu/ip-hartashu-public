import { useState } from "react";
import { useNavigate } from "react-router";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import Toastify from "toastify-js";
import baseUrl from "../api/baseUrl";
import showToast from "../utils/toast";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setForm((prevFrom) => {
      return {
        ...prevFrom,
        [e.target.name]: e.target.value,
      };
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const { data } = await axios.post(`${baseUrl}/login`, form);

      localStorage.setItem("access_token", data.access_token);

      showToast("Login successfully");

      navigate("/");
    } catch (error) {
      console.log(error);
      showToast(error.response.data.error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    console.log(credentialResponse);

    try {
      setIsLoading(true);

      const { data } = await axios.post(`${baseUrl}/google-login`, null, {
        headers: {
          google_token: credentialResponse.credential,
        },
      });

      localStorage.setItem("access_token", data.access_token);

      showToast("Login successfully");

      navigate("/");
    } catch (error) {
      console.log(error);
      showToast(error.response.data.error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        method="post"
        className="flex flex-col gap-6 bg-white p-8 rounded-lg shadow-md w-96"
        onSubmit={handleLoginSubmit}
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>{" "}
        <label htmlFor="username" className="text-gray-700 font-medium">
          Username
        </label>{" "}
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Enter your username..."
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleInputChange}
          value={form.username}
        />
        <label htmlFor="password" className="text-gray-700 font-medium">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password..."
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={handleInputChange}
          value={form.password}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Joining..." : "Join Chat"}
        </button>
        <p className="text-center">or</p>
        <div className="w-full flex justify-center items-center">
          <GoogleLogin onSuccess={handleGoogleLogin} className="w-full" />
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
