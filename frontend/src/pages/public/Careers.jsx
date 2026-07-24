import { Briefcase, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Careers = () => {
  const jobs = [
    { title: 'Senior Full Stack Engineer', dept: 'Engineering', location: 'Remote / US' },
    { title: 'Account Executive', dept: 'Sales', location: 'New York, NY' },
    { title: 'Product Designer (UI/UX)', dept: 'Design', location: 'Remote / US' },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Join Our <span className="gradient-text">Team</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          We are building the future of B2B lead management. Help us empower thousands of sales teams.
        </p>
      </div>

      <div className="space-y-4 max-w-4xl mx-auto">
        {jobs.map((j, idx) => (
          <div key={idx} className="card p-6 flex items-center justify-between hover:shadow-card-hover transition-all">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{j.title}</h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1"><Briefcase size={14} /> {j.dept}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {j.location}</span>
              </div>
            </div>
            <Button size="sm" variant="secondary">
              Apply Now <ArrowRight size={14} />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
