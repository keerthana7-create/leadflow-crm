import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from './admin/AdminDashboard';
import { MemberDashboard } from './member/MemberDashboard';

export const DashboardIndex = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <MemberDashboard />;
};
