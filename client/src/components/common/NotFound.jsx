import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-yellow-500 mb-4">404</h1>
        <h2 className="text-2xl text-white mb-8">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Return Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;