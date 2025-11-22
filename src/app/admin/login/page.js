"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginMessage, setLoginMessage] = useState(""); // State for user feedback

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginMessage(""); // Clear previous messages

    const { username, password } = credentials;

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setLoginMessage("Login failed. Please check your credentials.");
        setIsSubmitting(false);
      } else if (result?.ok) {
        router.push("/admin/responses");
        router.refresh();
      }
    } catch (error) {
      console.error("Login Error:", error);
      setLoginMessage("An error occurred during sign-in.");
      setIsSubmitting(false);
    }
  };

  return (

    <div className="relative min-h-screen text-white">

      <div

        className="relative z-10 text-center pt-24 pb-10 px-4"

        data-aos="fade-up"

      >

        <h1 className="batman-font text-4xl sm:text-5xl font-bold tracking-tight mb-4">

          Admin Login

        </h1>

        <p className="destruct-font text-gray-300 text-lg max-w-xl mx-auto">

          Access the control panel with your admin credentials.

        </p>

      </div>



      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">

        <div className="max-w-md mx-auto">

          <form

            onSubmit={handleSubmit}

            className="bg-gray-900/50 border border-gray-700/80 rounded-2xl p-6 sm:p-8 space-y-6"

          >

            <div>

              <label

                htmlFor="username"

                className="block text-sm font-semibold text-gray-300 mb-2 destruct-font"

              >

                Username

              </label>

              <input

                id="username"

                name="username"

                type="text"

                value={credentials.username}

                onChange={handleChange}

                autoComplete="username"

                required

                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"

                placeholder="Enter your username"

              />

            </div>



            <div>

              <label

                htmlFor="password"

                className="block text-sm font-semibold text-gray-300 mb-2 destruct-font"

              >

                Password

              </label>

              <input

                id="password"

                name="password"

                type="password"

                value={credentials.password}

                onChange={handleChange}

                autoComplete="current-password"

                required

                className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 destruct-font"

                placeholder="Enter your password"

              />

            </div>

            {loginMessage && (
              <div className="px-4 py-3 bg-red-600/20 border border-red-600/50 rounded-lg">
                <p className="destruct-font text-red-400 text-sm">{loginMessage}</p>
              </div>
            )}

            <div className="pt-2">

              <button

                type="submit"

                disabled={isSubmitting}

                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 batman-font text-lg tracking-wide"

              >

                {isSubmitting ? "Signing In..." : "Sign In"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>

  );

};



export default Login;