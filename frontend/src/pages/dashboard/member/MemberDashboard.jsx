import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, CheckCircle2, Clock, MessageSquare, ArrowRight, Eye } from 'lucide-react';
import { leadService } from '../../../services/leadService';
import { StatusBadge } from '../../../components/ui/Badge';
import { StatCardSkeleton } from '../../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../../components/ui/States';
import { timeAgo } from '../../../utils/formatDate';
import toast from 'react-hot-toast';

export const MemberDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadService.getLeads({ limit: 50 });
      setLeads(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch assigned leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLeads();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadService.updateLead(leadId, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchMyLeads();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchMyLeads} />;
  }

  const pendingFollowups = leads.filter((l) => ['New', 'Contacted', 'Qualified'].includes(l.status));
  const wonDeals = leads.filter((l) => l.status === 'Won');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Rep Dashboard</h1>
        <p className="text-sm text-slate-500">Manage your assigned prospects, update statuses, and log notes.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Leads</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{leads.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
            <Target size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Pending Follow-ups</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{pendingFollowups.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>

        <div className="card p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Won Deals</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{wonDeals.length}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/40 text-green-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Assigned Leads Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">Your Active Leads</h3>
          <span className="text-xs text-slate-500">{leads.length} total</span>
        </div>

        {leads.length === 0 ? (
          <EmptyState title="No leads assigned to you yet" description="Ask your admin to assign new inbound prospects to your account." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="table-header">
                  <th className="table-cell">Lead Name</th>
                  <th className="table-cell">Company</th>
                  <th className="table-cell">Status</th>
                  <th className="table-cell">Assigned Date</th>
                  <th className="table-cell text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row">
                    <td className="table-cell font-medium text-slate-900 dark:text-white">
                      <div>{lead.name}</div>
                      <div className="text-xs text-slate-400 font-normal">{lead.email}</div>
                    </td>
                    <td className="table-cell">{lead.company || '—'}</td>
                    <td className="table-cell">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                        className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1 font-medium text-slate-700 dark:text-slate-200 focus:outline-none"
                      >
                        {['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Won', 'Lost'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell text-xs text-slate-500">{timeAgo(lead.createdAt)}</td>
                    <td className="table-cell text-right">
                      <Link
                        to={`/dashboard/leads/${lead._id}`}
                        className="btn-ghost text-xs inline-flex items-center gap-1"
                      >
                        <Eye size={14} /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
