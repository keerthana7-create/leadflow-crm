import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle2, Mail, Phone, Building, User, MessageSquare } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await leadService.createLead(data);
      setSubmitted(true);
      toast.success('Thank you! Your lead request has been submitted.');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit lead request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
          Get in Touch with Our <span className="gradient-text">Sales Team</span>
        </h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Fill out the form below and one of our sales representatives will follow up within 24 hours.
        </p>
      </div>

      <div className="card p-8 sm:p-12 shadow-xl border border-slate-200 dark:border-slate-800">
        {submitted ? (
          <div className="py-12 text-center animate-fade-in space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Inquiry Received!</h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Your information has been logged into our LeadFlow CRM system. Our sales team will reach out shortly.
            </p>
            <div className="pt-4">
              <Button onClick={() => setSubmitted(false)} variant="secondary">
                Submit Another Request
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="label flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="input"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="label flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="john@company.com"
                  className="input"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone */}
              <div>
                <label className="label flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input"
                  {...register('phone', { required: 'Phone number is required' })}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* Company */}
              <div>
                <label className="label flex items-center gap-2">
                  <Building size={16} className="text-slate-400" />
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Acme Corp"
                  className="input"
                  {...register('company', { required: 'Company name is required' })}
                />
                {errors.company && (
                  <p className="text-xs text-red-500 mt-1">{errors.company.message}</p>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="label flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-400" />
                Message / Details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Tell us about your team and how we can help..."
                className="input py-2.5 resize-y"
                {...register('message', { required: 'Message details are required' })}
              />
              {errors.message && (
                <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" loading={loading} size="lg" className="w-full justify-center">
              <Send size={18} /> Submit Lead Request
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
