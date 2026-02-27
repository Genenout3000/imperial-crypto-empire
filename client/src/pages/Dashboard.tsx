import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, AlertCircle, Zap, Shield, Coins, Activity, Clock, DollarSign } from "lucide-react";

// Mock data for demonstration
const programMetrics = [
  { name: "Pentacle", value: 95, status: "active", version: "2.1.0", lastUpdate: "2 hours ago" },
  { name: "YieldHarvester", value: 87, status: "active", version: "1.5.2", lastUpdate: "1 hour ago" },
  { name: "LiquiditySniffer", value: 92, status: "active", version: "1.3.1", lastUpdate: "30 mins ago" },
];

const agentPerformance = [
  { name: "Paul", earned: 2.45, lost: 0.12, winRate: 94, status: "running" },
  { name: "Ralph", earned: 1.87, lost: 0.08, winRate: 91, status: "running" },
];

const vaultData = [
  { name: "USDC Earn", tvl: 125000, apy: 8.5, health: 98, status: "active" },
  { name: "SOL Borrow", tvl: 85000, apy: 12.3, health: 75, status: "active" },
  { name: "USDT Earn", tvl: 95000, apy: 7.8, health: 99, status: "active" },
];

const chartData = [
  { time: "00:00", value: 245000, yield: 1200 },
  { time: "04:00", value: 248500, yield: 1450 },
  { time: "08:00", value: 252000, yield: 1680 },
  { time: "12:00", value: 258000, yield: 2100 },
  { time: "16:00", value: 263500, yield: 2450 },
  { time: "20:00", value: 268000, yield: 2800 },
  { time: "24:00", value: 275000, yield: 3200 },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Imperial Crypto Empire</h1>
              <p className="text-muted-foreground mt-1">Autonomous Operations Platform</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="status-active">
                <Zap className="w-3 h-3 mr-1" />
                All Systems Active
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="metric-card glow-accent">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label">Total Portfolio Value</p>
                <p className="metric-value">$275,000</p>
                <p className="metric-change positive">↑ 2.4% today</p>
              </div>
              <DollarSign className="w-8 h-8 text-accent opacity-20" />
            </div>
          </Card>

          <Card className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label">Total Yield Earned</p>
                <p className="metric-value">$3,200</p>
                <p className="metric-change positive">↑ 12% this week</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label">Active Vaults</p>
                <p className="metric-value">3</p>
                <p className="metric-change">All healthy</p>
              </div>
              <Shield className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="metric-card">
            <div className="flex items-start justify-between">
              <div>
                <p className="metric-label">Agent Win Rate</p>
                <p className="metric-value">92.5%</p>
                <p className="metric-change positive">↑ Improving</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="vaults">Vaults</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                <p className="text-sm text-muted-foreground">24-hour yield accumulation</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Vault Health Warning</p>
                      <p className="text-xs text-muted-foreground">SOL Borrow vault health at 75%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Program Upgrade Available</p>
                      <p className="text-xs text-muted-foreground">Pentacle v2.2.0 ready for deployment</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  {[
                    { name: "Helius RPC", status: "operational" },
                    { name: "Jupiter Lend", status: "operational" },
                    { name: "Supabase Backend", status: "operational" },
                    { name: "Agent Loops", status: "running" },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-sm">{item.name}</span>
                      <Badge className="status-active">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Deployed Programs</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-sm">Program</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Health</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Version</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-sm">Last Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {programMetrics.map((prog) => (
                      <tr key={prog.name} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium">{prog.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${prog.value}%` }} />
                            </div>
                            <span className="text-sm">{prog.value}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">{prog.version}</td>
                        <td className="py-3 px-4">
                          <Badge className="status-active">{prog.status}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{prog.lastUpdate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agentPerformance.map((agent) => (
                <Card key={agent.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{agent.name}</h4>
                      <Badge className="status-active mt-2">{agent.status}</Badge>
                    </div>
                    <Coins className="w-8 h-8 text-accent opacity-20" />
                  </div>
                  <div className="divider-elegant my-4" />
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Earned</p>
                      <p className="text-lg font-bold text-green-500">${agent.earned.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Lost</p>
                      <p className="text-lg font-bold text-red-500">${agent.lost.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Win Rate</p>
                      <p className="text-lg font-bold text-blue-500">{agent.winRate}%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Vaults Tab */}
          <TabsContent value="vaults" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {vaultData.map((vault) => (
                <Card key={vault.name} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold">{vault.name}</h4>
                      <Badge className="status-active mt-2">{vault.status}</Badge>
                    </div>
                    <Shield className="w-8 h-8 text-accent opacity-20" />
                  </div>
                  <div className="divider-elegant my-4" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">TVL</p>
                      <p className="text-lg font-bold">${(vault.tvl / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">APY</p>
                      <p className="text-lg font-bold text-green-500">{vault.apy}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Health Ratio</p>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-green-500" style={{ width: `${vault.health}%` }} />
                      </div>
                      <p className="text-xs mt-1">{vault.health}%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
