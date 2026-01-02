import React from 'react';
import { FaGoogle, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

const GoogleAuthButton = ({ text = "Continue with Google" }) => {
  const isGoogleConfigured = () => {
    // Now that credentials are configured, return true
    return true;
  };

  const handleGoogleAuth = async () => {
    if (!isGoogleConfigured()) {
      toast.info('Google OAuth setup required. Please check GOOGLE_AUTH_SETUP.md for instructions.', {
        autoClose: 5000
      });
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.location.href = `${baseUrl}/api/auth/google`;
    } catch (error) {
      console.error('Google Auth Error:', error);
      toast.error('Google authentication failed. Please try again.');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleGoogleAuth}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
          isGoogleConfigured() 
            ? 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400' 
            : 'bg-gray-100 border-2 border-gray-200 text-gray-500 cursor-pointer'
        }`}
      >
        <FaGoogle className="text-red-500 text-lg" />
        {text}
        {!isGoogleConfigured() && <FaInfoCircle className="text-blue-500 text-sm ml-1" />}
      </button>
      {!isGoogleConfigured() && (
        <p className="text-xs text-gray-500 mt-1 text-center">
          Google OAuth setup required - see GOOGLE_AUTH_SETUP.md
        </p>
      )}
    </div>
  );
};

export default GoogleAuthButton;