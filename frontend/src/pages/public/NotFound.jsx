import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Home, AlertCircle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="card p-12 max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Page Not Found</h2>
        <p className="text-sm text-slate-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="w-full justify-center">
            <Home size={16} /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
