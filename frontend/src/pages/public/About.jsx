import { Shield, Zap, Target, Users } from 'lucide-react';

export const About = () => {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          About <span className="gradient-text">LeadFlow CRM</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Empowering modern sales teams with efficient lead management, real-time conversion tracking, and automated audit trails.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto">
            <Target size={24} />
          </div>
          <h3 className="text-xl font-bold">Our Mission</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            To eliminate lost deals caused by fragmented spreadsheets and slow follow-ups.
          </p>
        </div>

        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center mx-auto">
            <Users size={24} />
          </div>
          <h3 className="text-xl font-bold">Built for Reps</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Designed for clarity, quick note logging, and zero-friction pipeline movement.
          </p>
        </div>

        <div className="card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center mx-auto">
            <Shield size={24} />
          </div>
          <h3 className="text-xl font-bold">Security First</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Protected by role-based access control (RBAC), JWT encryption, and strict data boundary guards.
          </p>
        </div>
      </div>
    </div>
  );
};
