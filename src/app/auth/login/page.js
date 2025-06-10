"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Phone, ArrowRight } from "lucide-react";
import { authService } from "@/api";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // 'success' or 'error'
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const showToastNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await authService.login(data.mobile);

      if (response.detail === "OTP sent successfully") {
        // Show success toast
        showToastNotification(
          "OTP sent successfully! Redirecting...",
          "success"
        );

        localStorage.setItem("mobileNumber", data.mobile);

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/auth/verify-otp");
        }, 1000);
      } else {
        // Handle unsuccessful login
        const errorMsg =
          response?.msg ||
          response?.detail ||
          "Failed to send OTP. Please try again.";
        setErrorMessage(errorMsg);
        showToastNotification(errorMsg, "error");
      }
    } catch (error) {
      console.error("Login error details:", error);
      const errorMsg =
        "Error connecting to the server. Please try again later.";
      setErrorMessage(errorMsg);
      showToastNotification(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {/* Toast notification */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all transform duration-300 ${
            toastType === "success"
              ? "bg-green-100 border-l-4 border-green-500"
              : "bg-red-100 border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center">
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                toastType === "success" ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {toastType === "success" ? (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              )}
            </div>
            <p
              className={`text-sm font-medium ${
                toastType === "success" ? "text-green-800" : "text-red-800"
              }`}
            >
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md px-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 mb-4">
            <img
              src="/images/logo.png"
              alt="MM Outlet Management"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Sign in
            </h2>
            <p className="text-gray-600 text-sm">
              Enter your mobile number to receive an OTP
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1">
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={10} className="text-gray-400" />
                </div>
                <input
                  id="mobile"
                  type="tel"
                  {...register("mobile", {
                    required: "Mobile number is required",
                    maxLength: {
                      value: 10,
                      message: "Mobile number must be 10 digits",
                    },
                  })}
                  maxLength={10}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter your mobile number"
                />
              </div>
              {errors.mobile && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.mobile.message}
                </p>
              )}
              {errorMessage && (
                <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending OTP...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to our Terms of Service and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
