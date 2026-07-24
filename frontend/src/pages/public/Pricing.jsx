import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const Pricing = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      desc: 'Ideal for small sales teams just getting organized.',
      features: [
        'Up to 500 Active Leads',
        '3 Team Members',
        'Public Lead Capture Form',
        'Basic Activity Logs',
        'Standard Email Support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      desc: 'Perfect for growing businesses expanding their sales rep team.',
      features: [
        'Unlimited Active Leads',
        'Up to 15 Team Members',
        'Advanced Analytics & Charts',
        'CSV Export',
        'Activity Timeline & Notes',
        'Priority Support',
      ],
      cta: 'Get Started',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      desc: 'Custom workflows and dedicated SLA for large teams.',
      features: [
        'Everything in Professional',
        'Unlimited Team Members',
        'Custom Roles & RBAC',
        'Dedicated Account Manager',
        '99.9% Uptime Guarantee SLA',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Simple, Transparent <span className="gradient-text">Pricing</span>
        </h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
          Choose the right plan for your business. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`card p-8 flex flex-col justify-between relative ${
              plan.popular ? 'border-2 border-primary-500 shadow-xl scale-105 z-10' : ''
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full shadow-md">
                Most Popular
              </span>
            )}

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
              <p className="text-sm text-slate-500 mb-6">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                <span className="text-sm text-slate-500">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                    <Check size={16} className="text-green-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link to="/contact" className="w-full">
              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full justify-center"
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
