import { useAuth } from "@/components/auth/AuthProvider";
import AdminLogin from "@/components/auth/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

const AdminPage = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div
          className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"
          aria-label="Loading"
          data-testid="status-loading"
        />
      </div>
    );
  }

  if (user && isAdmin) {
    return <AdminDashboard />;
  }

  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h1 className="text-2xl font-bold mb-4" data-testid="text-access-denied">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You don&apos;t have admin privileges.
          </p>
        </div>
      </div>
    );
  }

  return <AdminLogin />;
};

export default AdminPage;
