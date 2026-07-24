import { Shield, Zap, BarChart3, Users, Clock, Filter, FileSpreadsheet, Lock } from 'lucide-react';

export const Features = () => {
  const featureList = [
    {
      icon: Zap,
      title: 'Automated Lead Capture',
      desc: 'Seamlessly capture leads directly from your public marketing contact page. Zero manually copied data.',
    },
    {
      icon: Users,
      title: 'Role-Based Access (RBAC)',
      desc: 'Granular Admin and Member roles ensure total control over lead assignments, data deletion, and team management.',
    },
    {
      icon: Clock,
      title: 'Activity Timeline',
      desc: 'Audit trail for every status change, note added, or team reassignment with accurate timestamps.',
    },
    {
      icon: BarChart3,
      title: 'Pipeline Analytics',
      desc: 'Real-time conversion rates, deal stage distributions, and lead velocity statistics.',
    },
    {
      icon: Filter,
      title: 'Smart Filtering & Search',
      desc: 'Filter leads instantly by status, assigned rep, company, or custom text query with pagination.',
    },
    {
      icon: FileSpreadsheet,
      title: 'CSV Export',
      desc: 'Export filtered lead sets into clean CSV format for reporting or offline analysis.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      desc: 'Protected with JWT tokens, password hashing with bcrypt, and strict input validation.',
    },
    {
      icon: Shield,
      title: 'Dark Mode Support',
      desc: 'Full high-contrast dark mode support tailored for all-day productivity.',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Powerful Features Built for <span className="gradient-text">Sales Execution</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Everything your sales team needs to capture, organize, and close prospects efficiently.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {featureList.map((item, idx) => (
          <div key={idx} className="card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div>
              <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4">
                <item.icon size={20} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
