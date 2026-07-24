import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Blog = () => {
  const posts = [
    {
      title: '5 Ways to Cut Lead Response Time in Half',
      excerpt: 'Learn how top-performing sales reps use central lead capture to follow up with inbound prospects in under 5 minutes.',
      date: 'July 24, 2026',
      author: 'LeadFlow Team',
    },
    {
      title: 'Why Spreadsheets Fail Growing Sales Teams',
      excerpt: 'Discover why manual spreadsheets create data silos and lead leakage as your sales team scales beyond 3 reps.',
      date: 'July 18, 2026',
      author: 'Growth Operations',
    },
    {
      title: 'Mastering Role-Based Access Control in CRM',
      excerpt: 'How to structure permissions so your sales reps focus on their pipeline while admins maintain total governance.',
      date: 'July 10, 2026',
      author: 'Security Team',
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          LeadFlow <span className="gradient-text">Blog</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Insights, best practices, and strategies for modern B2B sales teams.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {posts.map((post, idx) => (
          <div key={idx} className="card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all">
            <div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{post.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">{post.excerpt}</p>
            </div>
            <Link to="#" className="text-xs font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
              Read Article <ArrowRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
