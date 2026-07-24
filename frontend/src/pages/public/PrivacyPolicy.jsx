export const PrivacyPolicy = () => {
  return (
    <div className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
      <p className="text-xs text-slate-400">Last updated: July 24, 2026</p>

      <div className="card p-8 space-y-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">1. Information Collection</h3>
        <p>
          LeadFlow CRM collects information provided directly by users when submitting lead capture forms or creating workspace accounts, including names, business email addresses, telephone numbers, and company names.
        </p>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">2. Use of Information</h3>
        <p>
          Collected information is used exclusively to facilitate sales pipeline management, track communication activity timelines, and provide authenticated access to the workspace.
        </p>

        <h3 className="text-base font-semibold text-slate-900 dark:text-white">3. Data Security</h3>
        <p>
          All data is encrypted in transit via SSL/TLS and protected using Industry Standard JWT authentication and hashed passwords.
        </p>
      </div>
    </div>
  );
};
