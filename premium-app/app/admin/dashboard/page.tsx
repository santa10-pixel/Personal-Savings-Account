"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { IndianRupee, TrendingUp, ShoppingBag, ArrowUpRight, LogOut, Download } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [router]);

  const handleLogout = async () => {
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/admin/login");
  };

  const exportCSV = () => {
    if (!stats?.recentOrders) return;
    const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
    const rows = stats.recentOrders.map((o: any) => [
      o.id, 
      o.customerName || 'Guest', 
      o.totalAmount, 
      o.status, 
      new Date(o.createdAt).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map((e: any[]) => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-foreground border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="h-20 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center font-bold font-heading">
            A.
          </div>
          <h1 className="font-heading text-xl font-medium hidden md:block">Admin Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={exportCSV} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-md hover:bg-secondary/50">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 transition-colors px-4 py-2 rounded-md hover:bg-red-500/10">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12 mt-10 space-y-10">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
              <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <IndianRupee className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold font-heading">₹{stats?.totalRevenue?.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4" /> <span>+14.5% from last month</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Today's Earnings</span>
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold font-heading">₹{stats?.todaysRevenue?.toLocaleString()}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm text-green-500">
              <ArrowUpRight className="h-4 w-4" /> <span>+5.2% from yesterday</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-secondary/30 border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
            <h2 className="text-3xl font-bold font-heading">{stats?.totalOrders}</h2>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              Across all categories
            </div>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-secondary/20 border border-border rounded-3xl p-8">
          <h3 className="text-lg font-medium mb-8">Revenue Overview (Last 7 Days)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" tickMargin={15} />
                <YAxis stroke="#888" tickFormatter={(val) => `₹${val}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#111', borderColor: '#333', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#fff" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-medium mb-6">Recent Transactions</h3>
          <div className="rounded-2xl border border-border bg-secondary/10 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-4 text-sm font-medium text-muted-foreground">Order ID</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Customer</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Date</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentOrders?.map((order: any, idx: number) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-4 text-sm font-mono text-muted-foreground">#{order.id.slice(-8)}</td>
                    <td className="p-4 text-sm font-medium">{order.customerName || 'Guest'}</td>
                    <td className="p-4 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'PAID' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No recent orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
