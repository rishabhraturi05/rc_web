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
        router.push("/admin");
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
        <h1 className="font-mono text-4xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
          {">_"} ADMIN_LOGIN
        </h1>
        <p className="font-mono text-gray-400 text-lg max-w-xl mx-auto">
          Access the control panel with your sysadmin credentials.
        </p>
      </div>



      <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-md mx-auto">
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 sm:p-8 space-y-6"
          >

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-bold text-white mb-2 font-mono uppercase tracking-wider"
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
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono"
                placeholder="root"
              />
            </div>



            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-white mb-2 font-mono uppercase tracking-wider"
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
                className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all duration-300 font-mono"
                placeholder="••••••••"
              />
            </div>

            {loginMessage && (
              <div className="px-4 py-3 bg-white/10 border border-red-500 rounded">
                <p className="font-mono text-red-500 text-sm">ERR: {loginMessage}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed font-bold rounded transition-all duration-300 font-mono uppercase tracking-widest border border-white"
              >
                {isSubmitting ? "[ AUTHENTICATING... ]" : "[ INITIATE_LOGIN ]"}
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>

  );

};



export default Login;