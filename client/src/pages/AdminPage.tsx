import { useState } from 'react'
import { useAuth } from "@/components/auth/AuthProvider";
import AdminLogin from "@/components/auth/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

function ChangePasswordPrompt() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.error) {
      setError(result.error.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold" data-testid="text-change-password-title">
            Change Your Password
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            You must change your password before continuing.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              data-testid="input-current-password"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="input-new-password"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="input-confirm-password"
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" data-testid="text-password-error">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={submitting} data-testid="button-change-password">
            {submitting ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

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

  if (user && isAdmin && user.mustChangePassword) {
    return <ChangePasswordPrompt />;
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
