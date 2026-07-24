import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  Clock,
  UserPlus,
  Trash2,
  Activity,
  MessageSquare,
} from 'lucide-react';
import { leadService } from '../../services/leadService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/States';
import { NotesSection } from '../../components/notes/NotesSection';
import { ActivityTimeline } from '../../components/activity/ActivityTimeline';
import { LEAD_STATUSES } from '../../utils/statusColors';
import { formatDateTime, timeAgo } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [lead, setLead] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchLeadDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [lData, nData, aData] = await Promise.all([
        leadService.getLead(id),
        leadService.getNotes(id),
        leadService.getActivities(id),
      ]);
      setLead(lData);
      setNotes(nData);
      setActivities(aData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch lead details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLeadDetails();
  }, [fetchLeadDetails]);

  useEffect(() => {
    if (isAdmin) {
      userService.getUsers().then(setUsers).catch(() => {});
    }
  }, [isAdmin]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await leadService.updateLead(id, { status: newStatus });
      setLead(updated);
      toast.success(`Status updated to ${newStatus}`);
      // Refresh activities
      const aData = await leadService.getActivities(id);
      setActivities(aData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (text) => {
    const newNote = await leadService.addNote(id, text);
    setNotes((prev) => [newNote, ...prev]);
    // Refresh activities
    const aData = await leadService.getActivities(id);
    setActivities(aData);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    try {
      const updated = await leadService.assignLead(id, selectedUserId);
      setLead(updated);
      toast.success('Lead assigned successfully');
      setAssignModalOpen(false);
      const aData = await leadService.getActivities(id);
      setActivities(aData);
    } catch (err) {
      toast.error('Failed to assign lead');
    }
  };

  const handleDeleteLead = async () => {
    try {
      await leadService.deleteLead(id);
      toast.success('Lead deleted');
      navigate('/dashboard/leads');
    } catch (err) {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchLeadDetails} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard/leads" className="btn-ghost text-xs">
          <ArrowLeft size={16} /> Back to Leads
        </Link>
        {isAdmin && (
          <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 size={14} /> Delete Lead
          </Button>
        )}
      </div>

      {/* Main Info Header Card */}
      <div className="card p-6 border-l-4 border-l-primary-600">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{lead.name}</h1>
              <StatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <Building size={14} /> {lead.company || 'No Company Specified'} • Source: <span className="font-semibold text-slate-700 dark:text-slate-300">{lead.source}</span>
            </p>
          </div>

          {/* Quick Actions / Status Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Change Status
              </label>
              <select
                value={lead.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="input py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-800"
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                  Assigned Rep
                </label>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedUserId(lead.assignedTo?._id || '');
                    setAssignModalOpen(true);
                  }}
                  className="text-xs"
                >
                  <UserPlus size={14} />
                  {lead.assignedTo?.name || 'Assign Rep'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Contact details grid */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Email Address</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Mail size={14} className="text-primary-500" /> {lead.email}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Phone Number</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Phone size={14} className="text-primary-500" /> {lead.phone || '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Created Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-500" /> {formatDateTime(lead.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-1">Last Updated</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Clock size={14} className="text-primary-500" /> {timeAgo(lead.updatedAt)}
            </span>
          </div>
        </div>

        {/* Message body if present */}
        {lead.message && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <span className="font-semibold block text-slate-700 dark:text-slate-200 mb-1">Original Lead Inquiry:</span>
            "{lead.message}"
          </div>
        )}
      </div>

      {/* Grid for Notes & Timeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Notes */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <MessageSquare size={18} className="text-primary-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Lead Notes ({notes.length})</h3>
          </div>
          <NotesSection notes={notes} onAddNote={handleAddNote} />
        </div>

        {/* Right Column: Activity Audit Timeline */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <Activity size={18} className="text-primary-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Activity History</h3>
          </div>
          <ActivityTimeline activities={activities} />
        </div>
      </div>

      {/* Assign Rep Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Reassign Sales Rep"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="label">Select Sales Representative</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="input"
              required
            >
              <option value="">Select user...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Lead Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete lead <span className="font-bold text-slate-900 dark:text-white">{lead.name}</span>? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteLead}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
