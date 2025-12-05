import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Stethoscope, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have access token in URL (from email link)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    
    if (!accessToken) {
      toast({
        title: "Invalid link",
        description: "This password reset link is invalid or has expired.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      toast({
        title: "Password updated!",
        description: "Your password has been successfully reset.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/vet/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/vet/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <Card className="p-8 shadow-medium">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center text-foreground mb-2">Reset Password</h2>
          <p className="text-center text-muted-foreground mb-8">
            {success ? "Your password has been reset" : "Enter your new password"}
          </p>

          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full bg-gradient-primary" size="lg" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">
                Your password has been successfully updated. Redirecting to login...
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/vet/login")}
              >
                Go to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
