import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { Pricing } from './pages/public/Pricing';
import { Contact } from './pages/public/Contact';
import { About } from './pages/public/About';
import { Blog } from './pages/public/Blog';
import { Careers } from './pages/public/Careers';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { Terms } from './pages/public/Terms';
import { NotFound } from './pages/public/NotFound';

// Auth Pages
import { Login } from './pages/auth/Login';

// Dashboard Pages
import { DashboardIndex } from './pages/dashboard/DashboardIndex';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';
import { MemberDashboard } from './pages/dashboard/member/MemberDashboard';
import { LeadsTablePage } from './pages/dashboard/LeadsTablePage';
import { LeadDetail } from './pages/dashboard/LeadDetail';
import { UserManagement } from './pages/dashboard/UserManagement';
import { Profile } from './pages/dashboard/Profile';
import { Settings } from './pages/dashboard/Settings';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700 text-sm font-medium',
            }}
          />
          <Routes>
            {/* Public Marketing Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Route>

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />

            {/* Dashboard Protected Workspace Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardIndex />} />
              <Route
                path="admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="member" element={<MemberDashboard />} />
              <Route path="leads" element={<LeadsTablePage />} />
              <Route path="leads/:id" element={<LeadDetail />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute adminOnly>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404 Catch-all Route */}
            <Route element={<PublicLayout />}>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
