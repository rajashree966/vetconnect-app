import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VetLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement authentication
    toast({
      title: "Login functionality",
      description: "Authentication will be implemented soon!",
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <Card className="p-8 shadow-medium">
          <div className="flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">Veterinarian Login</h2>
          <p className="text-center text-muted-foreground mb-8">Welcome back, Doctor!</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Link to="/vet/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            
            <Button type="submit" className="w-full bg-gradient-primary" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/vet/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VetLogin;
