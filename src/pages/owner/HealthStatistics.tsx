import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingUp, Activity, Syringe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const HealthStatistics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchHealthStats();
    }
  }, [user]);

  const fetchHealthStats = async () => {
    try {
      const { data: records, error } = await supabase
        .from("medical_records")
        .select("*")
        .eq("pet_owner_id", user?.id)
        .order("date", { ascending: true });

      if (error) throw error;

      // Process data for charts
      const typeCount = records.reduce((acc: any, record: any) => {
        acc[record.type] = (acc[record.type] || 0) + 1;
        return acc;
      }, {});

      const monthlyData = records.reduce((acc: any, record: any) => {
        const month = new Date(record.date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalRecords: records.length,
        typeDistribution: Object.entries(typeCount).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
        })),
        monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({
          month,
          count,
        })),
      });
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

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#ef4444"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <p className="text-foreground">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-6">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/owner/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Health Statistics</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.totalRecords || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Syringe className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Vaccinations</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.typeDistribution?.find((t: any) => t.name === "Vaccination")
                    ?.value || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Activity className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Checkups</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats?.typeDistribution?.find((t: any) => t.name === "Checkup")?.value ||
                    0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Type Distribution Pie Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Records by Type
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats?.typeDistribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.name}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats?.typeDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Monthly Trend Line Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Monthly Trend
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Records"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthStatistics;
