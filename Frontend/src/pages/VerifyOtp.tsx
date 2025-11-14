import axios from "axios";
import type { FormEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  setAccessToken,
  setIsVerified,
  setName,
  setRole,
} from "../redux/UserSlice";

const VerifyOtp = () => {
  const Navigate = useNavigate();
  const dispatch = useDispatch();
  const userId = useSelector((state: RootState) => state.user.userId);
  const [otp, setOtp] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/verifyLogin",
        { otp, userId },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      console.log(res.data);

      if (res.data.success) {
        toast(res.data.message, {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        dispatch(setAccessToken(res.data.accessToken));
        dispatch(setIsVerified(res.data.user.isVerified));
        dispatch(setName(res.data.user.name));
        dispatch(setRole(res.data.user.role));
        Navigate("/");
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
            <h2 className="text-2xl font-bold text-center">Verify OTP</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block text-gray-700 text-sm font-medium mb-2"
              >
                Enter OTP:
              </label>
              <input
                ref={inputRef}
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FA812F] focus:border-transparent text-center text-lg tracking-wider"
                placeholder="••••••"
              />
              <p className="mt-2 text-gray-500 text-sm text-center">
                Enter the 6-digit code sent to your email or phone
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.length !== 6}
              className={`w-full font-bold py-2 px-4 rounded-md transition duration-300 ${
                otp.length === 6
                  ? "bg-[#FA812F] hover:bg-[#e06a1a] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Verify OTP
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                <a
                  href="#"
                  className="text-[#FA812F] hover:underline font-medium"
                >
                  Resend OTP
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
