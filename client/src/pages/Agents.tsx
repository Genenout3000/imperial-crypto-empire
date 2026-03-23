import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Brain, Shield, TrendingUp, AlertCircle, Zap } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  type: "yield" | "liquidity" | "guardian";
  status: "active" | "paused" | "error";
  performance: {
    totalActions: number;
    successRate: number;
    averageReturn: number;
  };
  lastDecision?: {
    action: string;
    confidence: number;
    reasoning: string;
    timestamp: string;
  };
}

export default function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock agent data for demonstration
    const mockAgents: Agent[] = [
      {
        id: "paul-yield-agent",
        name: "Paul",
        type: "yield",
        status: "active",
        performance: {
          totalActions: 1247,
          successRate: 0.85,
          averageReturn: 0.15,
        },
        lastDecision: {
          action: "harvest",
          confidence: 0.87,
          reasoning: "Strong yield opportunity detected in SOL-USDC pool",
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: "ralph-liquidity-agent",
        name: "Ralph",
        type: "liquidity",
        status: "active",
        performance: {
          totalActions: 892,
          successRate: 0.72,
          averageReturn: 0.22,
        },
        lastDecision: {
          action: "snipe",
          confidence: 0.79,
          reasoning: "Liquidity sniping opportunity on emerging token",
          timestamp: new Date().toISOString(),
        },
      },
      {
        id: "guardian-monitor-agent",
        name: "Guardian",
        type: "guardian",
        status: "active",
        performance: {
          totalActions: 5432,
          successRate: 0.99,
          averageReturn: 0,
        },
        lastDecision: {
          action: "monitor",
          confidence: 0.99,
          reasoning: "All systems nominal, vault health optimal",
          timestamp: new Date().toISOString(),
        },
      },
    ];

    setAgents(mockAgents);
    setLoading(false);
  }, []);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "yield":
        return <TrendingUp className="w-5 h-5" />;
      case "liquidity":
        return <Zap className="w-5 h-5" />;
      case "guardian":
        return <Shield className="w-5 h-5" />;
      default:
        return <Brain className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "paused":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autonomous Agents</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage Paul, Ralph, and Guardian autonomous agents
        </p>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-border/50 hover:border-border transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">{getAgentIcon(agent.type)}</div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription className="capitalize text-xs">{agent.type} agent</CardDescription>
                  </div>
                </div>
                <Badge className={`${getStatusColor(agent.status)} border`}>{agent.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Performance Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm font-semibold">{(agent.performance.successRate * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/50 h-2 rounded-full transition-all"
                    style={{ width: `${agent.performance.successRate * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Actions</span>
                  <span className="text-sm font-semibold">{agent.performance.totalActions.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Return</span>
                  <span className="text-sm font-semibold text-emerald-400">
                    +{(agent.performance.averageReturn * 100).toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Last Decision */}
              {agent.lastDecision && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">Last Decision</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium capitalize">{agent.lastDecision.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {(agent.lastDecision.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{agent.lastDecision.reasoning}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Coordination Status */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Agentic Orchestration Status
          </CardTitle>
          <CardDescription>Real-time coordination and decision-making</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Total Decisions</p>
              <p className="text-2xl font-bold">9,571</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Avg Confidence</p>
              <p className="text-2xl font-bold">82.1%</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">System Uptime</p>
              <p className="text-2xl font-bold">99.8%</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Coordination Cycles</p>
              <p className="text-2xl font-bold">1,247</p>
            </div>
          </div>

          {/* Alibaba DashScope Integration Status */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-300">Alibaba DashScope Integration</p>
                <p className="text-xs text-blue-200/70 mt-1">
                  Agentic AI system powered by Qwen models. Free tier: 70M tokens/month. All agents have autonomous
                  decision-making capabilities with real-time market analysis and strategy optimization.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Loop Information */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">Agent Loop Intervals</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-secondary/50 border border-border/50">
                <p className="text-muted-foreground">Paul (Yield)</p>
                <p className="font-mono text-primary">Every 30 seconds</p>
              </div>
              <div className="p-2 rounded bg-secondary/50 border border-border/50">
                <p className="text-muted-foreground">Ralph (Liquidity)</p>
                <p className="font-mono text-primary">Every 45 seconds</p>
              </div>
              <div className="p-2 rounded bg-secondary/50 border border-border/50">
                <p className="text-muted-foreground">Guardian (Monitor)</p>
                <p className="font-mono text-primary">Every 60 seconds</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health Alert */}
      <Card className="border-border/50 bg-emerald-500/5 border-emerald-500/20">
        <CardContent className="pt-6 flex items-start gap-3">
          <Activity className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-300">All Systems Operational</p>
            <p className="text-xs text-emerald-200/70 mt-1">
              Paul, Ralph, and Guardian agents are running autonomously with optimal performance. Alibaba DashScope
              integration active with mock fallback mode enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
