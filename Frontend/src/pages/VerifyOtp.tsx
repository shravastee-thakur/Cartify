import { useState, useRef } from 'react';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const inputRef = useRef(null);

  // Auto-focus the input on mount
//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, []);

  const handleChange = (e: any) => {
    const value = e.target.value;
    // Allow only digits and limit to 6 characters
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (otp.length !== 6) {
      alert('Please enter a 6-digit OTP.');
      return;
    }
    console.log('OTP submitted:', otp);
    // Add your verification logic here (e.g., API call)
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
              <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-2">
                Enter OTP:
              </label>
              <input
                ref={inputRef}
                type="text"
                id="otp"
                value={otp}
                onChange={handleChange}
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
                  ? 'bg-[#FA812F] hover:bg-[#e06a1a] text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Verify OTP
            </button>

            <div className="mt-4 text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{' '}
                <a href="#" className="text-[#FA812F] hover:underline font-medium">
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