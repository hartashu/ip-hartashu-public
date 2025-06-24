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
    <div className="min-h-screen flex justify-around items-center">
      <form
        method="post"
        className="flex flex-col gap-4 bg-orange-100"
        onSubmit={handleLoginSubmit}
      >
        <label htmlFor="username">Username</label>
        <input
          type="text"
          name="username"
          id="username"
          placeholder="Enter your username..."
          className="border"
          onChange={handleInputChange}
          value={form.username}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password..."
          className="border"
          onChange={handleInputChange}
          value={form.password}
        />
        <button type="submit" disabled={isLoading} className="border">
          {isLoading ? "Logging in..." : "Login"}
        </button>
        <GoogleLogin onSuccess={handleGoogleLogin} />
      </form>
    </div>
  );
};

export default LoginPage;
