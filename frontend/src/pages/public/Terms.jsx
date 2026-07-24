export const Terms = () => {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Terms of Service</h1>
      <p className="text-xs text-slate-400">Last updated: July 24, 2026</p>

      <div className="card p-8 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
        <p>
          By accessing or using LeadFlow CRM, you agree to be bound by these Terms of Service and all applicable data security policies.
        </p>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">2. User Conduct & Accounts</h3>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your user account.
        </p>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">3. Service Availability</h3>
        <p>
          We strive to maintain 99.8% service uptime for all lead management APIs and web services.
        </p>
      </div>
    </div>
  );
};
