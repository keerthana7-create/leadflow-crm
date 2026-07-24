import { useState } from 'react';
import { MessageSquare, Send, User, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { timeAgo } from '../../utils/formatDate';
import toast from 'react-hot-toast';

export const NotesSection = ({ notes = [], onAddNote }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      await onAddNote(text.trim());
      setText('');
      toast.success('Note added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Note Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          placeholder="Add a detailed note about this lead (e.g. Call outcomes, next steps)..."
          className="input resize-y"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={loading} disabled={!text.trim()} size="sm">
            <Send size={14} /> Add Note
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No notes added yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <User size={12} />
                  {note.userId?.name || 'User'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo(note.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                {note.text}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
