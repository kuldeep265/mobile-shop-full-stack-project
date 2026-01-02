import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const SetupStatus = () => {
  const [status, setStatus] = useState({
    backend: false,
    database: false,
    googleAuth: false,
    loading: true
  });

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      // Check backend connection
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/health`);
      const backendOk = backendResponse.ok;

      // Check Google OAuth configuration
      let googleAuthOk = false;
      try {
        const googleResponse = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api', '')}/api/auth/google`);
        googleAuthOk = googleResponse.ok;
      } catch (error) {
        googleAuthOk = false;
      }

      setStatus({
        backend: backendOk,
        database: backendOk, // If backend is working, database is connected
        googleAuth: googleAuthOk,
        loading: false
      });
    } catch (error) {
      setStatus({
        backend: false,
        database: false,
        googleAuth: false,
        loading: false
      });
    }
  };

  const StatusItem = ({ title, status, description, setupGuide }) => (
    <div className="flex items-start space-x-3 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-1">
        {status ? (
          <FaCheckCircle className="text-green-500 text-xl" />
        ) : (
          <FaTimesCircle className="text-red-500 text-xl" />
        )}
      </div>
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{description}</p>
        {!status && setupGuide && (
          <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
            <FaInfoCircle className="inline mr-1" />
            {setupGuide}
          </div>
        )}
      </div>
    </div>
  );

  if (status.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Setup Status</h1>
          <p className="text-gray-600">Check the configuration status of your MERN application</p>
        </div>

        <div className="space-y-4">
          <StatusItem
            title="Backend Server"
            status={status.backend}
            description="Express server running on port 5000"
            setupGuide={!status.backend ? "Make sure to run 'npm run dev' in the backend folder" : null}
          />

          <StatusItem
            title="Database Connection"
            status={status.database}
            description="MongoDB Memory Server for local development"
            setupGuide={!status.database ? "Database connection failed. Check backend server logs." : null}
          />

          <StatusItem
            title="Google OAuth"
            status={status.googleAuth}
            description="Google authentication for sign-in/sign-up"
            setupGuide={!status.googleAuth ? "Follow GOOGLE_AUTH_SETUP.md to configure Google OAuth credentials" : null}
          />
        </div>

        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              • <strong>Regular Login:</strong> Use piyush@gmail.com / Piyush123
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Google Setup:</strong> See GOOGLE_AUTH_SETUP.md for detailed instructions
            </p>
            <p className="text-sm text-gray-600">
              • <strong>Documentation:</strong> Check SETUP_VERIFICATION.md for troubleshooting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupStatus;