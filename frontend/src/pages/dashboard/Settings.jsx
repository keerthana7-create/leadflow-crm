import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Database, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Settings = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
        <p className="text-sm text-slate-500">Configure workspace theme preferences and inspect API status.</p>
      </div>

      {/* Theme Preference */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {isDark ? <Moon size={18} /> : <Sun size={18} />} Appearance Theme
        </h3>
        <p className="text-sm text-slate-500">
          Switch between light mode and dark mode for low-light environments.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={toggleTheme}>
            Toggle to {isDark ? 'Light' : 'Dark'} Mode
          </Button>
          <span className="text-xs text-slate-400">Current preference: <strong>{isDark ? 'Dark' : 'Light'}</strong></span>
        </div>
      </div>

      {/* Backend & Security Information */}
      <div className="card p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Database size={18} /> System Diagnostics & API Status
        </h3>
        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span>API Server Endpoint:</span>
            <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-primary-600">/api</code>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span>Authentication Protocol:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">JWT (JSON Web Token)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Database Backend:</span>
            <span className="font-medium text-slate-800 dark:text-slate-200">MongoDB Atlas / Mongoose ORM</span>
          </div>
        </div>
      </div>
    </div>
  );
};
