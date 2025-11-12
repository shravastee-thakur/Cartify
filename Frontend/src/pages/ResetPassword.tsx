import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { FormEvent } from "react";
import axios from "axios";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const Navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/forgetPassword",
        { email },
        {
          withCredentials: true,
        }
      );
      console.log(res.data);
      if (res.data.success) {
        Navigate("/new-password");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-[#FA812F] p-6 text-white">
            <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Email Address:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent"
                placeholder="Enter your email"
              />
              <p className="mt-2 text-gray-500 text-sm">
                Enter your email and we’ll send you a link to reset your
                password.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FA812F] hover:bg-[#e06a1a] text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
              Send Reset Link
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Remember your password?
                <span className="text-[#FA812F] hover:underline font-medium">
                  <Link to={"/login"}>Back to Login</Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
