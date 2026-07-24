import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Zap, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@leadflow.com',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await login({ email: data.email, password: data.password });
      toast.success('Welcome back!');
      if (loggedUser?.role?.toLowerCase() === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/member');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email address');
      return;
    }
    setResetSubmitted(true);
    toast.success('Password reset link sent to ' + resetEmail);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg group-hover:shadow-glow transition-shadow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            Lead<span className="gradient-text">Flow</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Sign in to your CRM account
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Access your leads dashboard and sales pipeline.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="card p-8 shadow-xl border border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@leadflow.com"
                  className="input pl-10"
                  {...register('email', { required: 'Email is required' })}
                />
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  {...register('password', { required: 'Password is required' })}
                />
                <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setResetSubmitted(false);
                  setForgotModalOpen(true);
                }}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">Default Credentials:</p>
            <p>Admin: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-primary-600">admin@leadflow.com</code> / <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">password123</code></p>
            <p>Member: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-primary-600">john@leadflow.com</code> / <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">password123</code></p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Your Password"
      >
        {resetSubmitted ? (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <KeyRound size={24} />
            </div>
            <h4 className="font-semibold text-lg">Check your inbox</h4>
            <p className="text-sm text-slate-500">
              We sent password reset instructions to <span className="font-medium text-slate-700 dark:text-slate-300">{resetEmail}</span>.
            </p>
            <div className="pt-4">
              <Button onClick={() => setForgotModalOpen(false)} variant="secondary" className="w-full justify-center">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setForgotModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Send Reset Link</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
