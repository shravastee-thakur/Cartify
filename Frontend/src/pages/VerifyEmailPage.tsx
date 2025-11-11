import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState<string>("");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  if (!token) {
    setStatus("error");
    setMessage("No verification token found.");
    return;
  }

  const verify = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/verify-email",
        { token },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        console.log(res.data);

        setStatus("success");
        setMessage("Your email has been verified! Your account is now active.");
      } else {
        setStatus("error");
        setMessage(
          res.data.message ||
            "Verification failed. The link may be invalid or expired."
        );
      }
    } catch (error: any) {
      setStatus("error");
      setMessage(
        "An error occurred while verifying your email. Please try again."
      );
    }
  };

  useEffect(() => {
    verify();
  }, [token]);

  if (status === "verifying") {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FA812F] mb-4"></div>
          <p className="text-gray-700">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white shadow-xl rounded-lg p-8">
          {status === "success" ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="inline-block bg-[#FA812F] hover:bg-[#e06a1a] text-white font-bold py-2 px-6 rounded-md transition">
                <Link to={"/login"}>Go to Login</Link>
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <a
                href="/resend-verification"
                className="inline-block bg-[#FA812F] hover:bg-[#e06a1a] text-white font-bold py-2 px-6 rounded-md transition"
              >
                Resend Verification Email
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
