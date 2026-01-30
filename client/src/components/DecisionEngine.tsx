
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Shield, AlertTriangle, LogOut, Wrench, Search } from "lucide-react";
import type { DecisionRecommendation } from "@/lib/advanced-physics";

interface DecisionEngineProps {
  recommendations: DecisionRecommendation[];
}

export function DecisionEngine({ recommendations }: DecisionEngineProps) {
  const priorityColors = {
    low: 'border-l-green-500 bg-green-500/5',
    medium: 'border-l-yellow-500 bg-yellow-500/5',
    high: 'border-l-orange-500 bg-orange-500/5',
    critical: 'border-l-red-500 bg-red-500/10 animate-pulse'
  };

  const priorityBadgeColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  };

  const iconMap = {
    shield: <Shield className="h-5 w-5" />,
    alert: <AlertTriangle className="h-5 w-5" />,
    evacuate: <LogOut className="h-5 w-5" />,
    repair: <Wrench className="h-5 w-5" />,
    inspect: <Search className="h-5 w-5" />
  };

  return (
    <Card className="glass-panel border-l-4 border-l-blue-500" data-testid="card-decision-engine">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Brain className="h-4 w-4 text-blue-400" />
          DECISION INTELLIGENCE ENGINE
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Run simulation to generate recommendations
              </div>
            ) : (
              recommendations.map((rec, idx) => (
                <div 
                  key={idx}
                  className={`rounded-lg border-l-4 p-3 ${priorityColors[rec.priority]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded ${priorityBadgeColors[rec.priority]}`}>
                      {iconMap[rec.icon]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{rec.action}</span>
                        <Badge className={priorityBadgeColors[rec.priority]} variant="outline">
                          {rec.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{rec.reasoning}</p>
                      <div className="text-[10px] text-muted-foreground">
                        Timeframe: <span className="text-foreground">{rec.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
