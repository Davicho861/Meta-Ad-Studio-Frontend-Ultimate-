import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
  // In production we avoid noisy console output; keep this intentionally silent for demo.
  void location.pathname;
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
        <p className="mb-4 text-xl text-gray-700">Oops! Page not found</p>
        <a href="/" className="text-blue-600 underline hover:text-blue-800">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
