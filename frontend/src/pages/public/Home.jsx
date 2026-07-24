import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Shield, BarChart3, Users, Star, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Home = () => {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold text-primary-700 dark:text-primary-300 mb-8 animate-fade-in">
            <Zap size={14} />
            <span>Next-Gen Lead Management CRM</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Manage, Track & Convert Leads <span className="gradient-text">Efficiently</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Stop losing potential deals in spreadsheets. LeadFlow CRM centralizes your public leads, tracks communication timeline, and empowers your sales reps to close faster.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-primary-500/25">
                Get Started Free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200/60 dark:border-slate-800/60">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">99.8%</p>
              <p className="text-xs text-slate-500 font-medium">Uptime Guarantee</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">3.5x</p>
              <p className="text-xs text-slate-500 font-medium">Faster Lead Follow-up</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">10M+</p>
              <p className="text-xs text-slate-500 font-medium">Leads Managed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white">4.9/5</p>
              <p className="text-xs text-slate-500 font-medium">User Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
            Everything your sales team needs to thrive
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            Built from the ground up for performance, simplicity, and conversion optimization.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card p-8 hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Instant Lead Capture</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Embed directly into your marketing website. Incoming form submissions automatically generate structured lead records with timeline tracking.
            </p>
          </div>

          <div className="card p-8 hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Role-Based Access Control</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Admins manage team permissions, assign leads, and monitor pipeline metrics. Members focus on their assigned leads and activity logging.
            </p>
          </div>

          <div className="card p-8 hover:shadow-card-hover transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center mb-6">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Actionable Analytics</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Gain real-time insights into conversion rates, pipeline velocity, and team performance with interactive dashboard metrics and charts.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-20 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Loved by fast-growing sales teams
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400">
              Here is what revenue leaders say about LeadFlow CRM.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "LeadFlow reduced our lead response time from 4 hours to 5 minutes. Our conversion rates jumped by 42% in month one.",
                author: "Sarah Jenkins",
                role: "VP of Sales, GrowthX",
              },
              {
                quote: "The activity timeline and note-taking features keep our team completely synchronized. No lead ever slips through the cracks.",
                author: "Michael Chang",
                role: "Founder, Apex Digital",
              },
              {
                quote: "Extremely fast, clean UI, and setup took less than 10 minutes. Easily the best CRM decision we made this year.",
                author: "Elena Rostova",
                role: "Head of Growth, NovaCloud",
              },
            ].map((t, idx) => (
              <div key={idx} className="card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm italic leading-relaxed mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{t.author}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-10 sm:p-16 bg-gradient-to-r from-primary-600 to-blue-700 text-white rounded-3xl text-center relative overflow-hidden shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to accelerate your lead pipeline?</h2>
          <p className="text-primary-100 max-w-xl mx-auto mb-8 text-base sm:text-lg">
            Join hundreds of forward-thinking teams using LeadFlow CRM to convert leads into loyal customers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-slate-100 shadow-lg">
                Get Started Now <ArrowUpRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
