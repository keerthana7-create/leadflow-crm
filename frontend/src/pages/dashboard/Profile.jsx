import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../../components/ui/Badge';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';

export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Profile</h1>
        <p className="text-sm text-slate-500">View your account details and role permissions.</p>
      </div>

      <div className="card p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <RoleBadge role={user?.role} />
              <span className="text-xs text-slate-400">• Account Active</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold uppercase">
              <Mail size={14} /> Email Address
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold uppercase">
              <Shield size={14} /> Role Assigned
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{user?.role}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 space-y-1">
            <span className="text-slate-400 flex items-center gap-1.5 text-xs font-semibold uppercase">
              <Calendar size={14} /> Account Created
            </span>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(user?.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
