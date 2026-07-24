import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit2,
  Trash2,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import { leadService } from '../../services/leadService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/States';
import { downloadCSV } from '../../utils/csvDownload';
import { LEAD_STATUSES } from '../../utils/statusColors';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export const LeadsTablePage = () => {
  const { isAdmin } = useAuth();

  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');

  // Modals
  const [assignModal, setAssignModal] = useState({ open: false, lead: null, userId: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
  const [createModal, setCreateModal] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [submittingLead, setSubmittingLead] = useState(false);

  const fetchLeads = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await leadService.getLeads({
        page,
        limit: 10,
        search,
        status: statusFilter,
        assignedTo: assignedFilter,
        company: companyFilter,
      });
      setLeads(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 10, total: 0, pages: 1 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, assignedFilter, companyFilter]);

  useEffect(() => {
    fetchLeads(1);
  }, [fetchLeads]);

  useEffect(() => {
    if (isAdmin) {
      userService.getUsers().then(setUsers).catch(() => {});
    }
  }, [isAdmin]);

  const handleExportCSV = async () => {
    try {
      const blob = await leadService.exportCSV({
        search,
        status: statusFilter,
        assignedTo: assignedFilter,
        company: companyFilter,
      });
      downloadCSV(blob, `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      toast.success('CSV export downloaded');
    } catch (err) {
      toast.error('Failed to export CSV');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignModal.userId) return;
    try {
      await leadService.assignLead(assignModal.lead._id, assignModal.userId);
      toast.success('Lead assigned successfully');
      setAssignModal({ open: false, lead: null, userId: '' });
      fetchLeads(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign lead');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await leadService.deleteLead(deleteModal.lead._id);
      toast.success('Lead deleted successfully');
      setDeleteModal({ open: false, lead: null });
      fetchLeads(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      await leadService.createLead(newLead);
      toast.success('Lead created successfully');
      setCreateModal(false);
      setNewLead({ name: '', email: '', phone: '', company: '', message: '' });
      fetchLeads(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Management</h1>
          <p className="text-sm text-slate-500">Search, filter, assign, and track leads through the sales pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </Button>
          <Button onClick={() => setCreateModal(true)}>
            <Plus size={16} /> Add Lead
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input text-xs"
        >
          <option value="">All Statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Assigned User Filter (Admin only) */}
        {isAdmin ? (
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            className="input text-xs"
          >
            <option value="">All Reps</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder="Filter company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="input text-xs"
          />
        )}

        {/* Clear Filters */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setAssignedFilter('');
            setCompanyFilter('');
          }}
          className="justify-center text-xs"
        >
          <RefreshCw size={14} /> Clear Filters
        </Button>
      </div>

      {/* Leads Table Card */}
      <div className="card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => fetchLeads(pagination.page)} />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No leads found"
            description="Try adjusting your search filters or add a new lead to get started."
            action={() => setCreateModal(true)}
            actionLabel="Create Lead"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="table-header">
                    <th className="table-cell">Lead Name</th>
                    <th className="table-cell">Company</th>
                    <th className="table-cell">Status</th>
                    <th className="table-cell">Assigned Rep</th>
                    <th className="table-cell">Created Date</th>
                    <th className="table-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="table-row">
                      <td className="table-cell">
                        <div className="font-semibold text-slate-900 dark:text-white">{lead.name}</div>
                        <div className="text-xs text-slate-400">{lead.email} {lead.phone && `• ${lead.phone}`}</div>
                      </td>
                      <td className="table-cell font-medium text-slate-700 dark:text-slate-300">
                        {lead.company || '—'}
                      </td>
                      <td className="table-cell">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="table-cell text-xs">
                        {lead.assignedTo ? (
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {lead.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">Unassigned</span>
                        )}
                      </td>
                      <td className="table-cell text-xs text-slate-500">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/dashboard/leads/${lead._id}`}>
                            <button className="btn-ghost p-1.5" title="View Details">
                              <Eye size={16} />
                            </button>
                          </Link>

                          {isAdmin && (
                            <button
                              onClick={() => setAssignModal({ open: true, lead, userId: lead.assignedTo?._id || '' })}
                              className="btn-ghost p-1.5 text-blue-600"
                              title="Assign Rep"
                            >
                              <UserPlus size={16} />
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => setDeleteModal({ open: true, lead })}
                              className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                              title="Delete Lead"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={fetchLeads} />
          </>
        )}
      </div>

      {/* Assign Modal */}
      <Modal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, lead: null, userId: '' })}
        title={`Assign Lead: ${assignModal.lead?.name || ''}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="label">Select Sales Representative</label>
            <select
              value={assignModal.userId}
              onChange={(e) => setAssignModal({ ...assignModal, userId: e.target.value })}
              className="input"
              required
            >
              <option value="">Choose User...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.email} - {u.role})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setAssignModal({ open: false, lead: null, userId: '' })}>
              Cancel
            </Button>
            <Button type="submit">Confirm Assignment</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, lead: null })}
        title="Confirm Delete Lead"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to permanently delete lead <span className="font-semibold text-slate-900 dark:text-white">{deleteModal.lead?.name}</span>? This action will remove all notes and activity logs.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setDeleteModal({ open: false, lead: null })}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete Lead
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Lead Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Add New Lead Manually"
      >
        <form onSubmit={handleCreateLead} className="space-y-4">
          <div>
            <label className="label">Lead Name *</label>
            <input
              type="text"
              required
              className="input"
              value={newLead.name}
              onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                required
                className="input"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="text"
                className="input"
                value={newLead.phone}
                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Company</label>
            <input
              type="text"
              className="input"
              value={newLead.company}
              onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Initial Notes / Message</label>
            <textarea
              rows={3}
              className="input"
              value={newLead.message}
              onChange={(e) => setNewLead({ ...newLead, message: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submittingLead}>
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
