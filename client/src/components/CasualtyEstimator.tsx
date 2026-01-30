
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, AlertTriangle, Skull } from "lucide-react";
import type { CasualtyEstimate } from "@/lib/advanced-physics";

interface CasualtyEstimatorProps {
  estimate: CasualtyEstimate;
}

export function CasualtyEstimator({ estimate }: CasualtyEstimatorProps) {
  const severityColors = {
    low: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    high: 'bg-orange-500/20 text-orange-400',
    critical: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className="glass-panel border-l-4 border-l-red-500" data-testid="card-casualty-estimator">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Skull className="h-4 w-4 text-red-400" />
          LIFE-LOSS PROBABILITY ENGINE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded p-3 text-center ${severityColors[estimate.severity]}`}>
            <div className="text-2xl font-mono font-bold">{estimate.casualtyRiskPercent}%</div>
            <div className="text-[10px] uppercase">Casualty Risk</div>
          </div>
          
          <div className="bg-black/30 rounded p-3 text-center">
            <div className="text-2xl font-mono font-bold text-red-400">{estimate.occupancyAtRisk}</div>
            <div className="text-[10px] text-muted-foreground uppercase">People at Risk</div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-black/20 rounded p-2">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            RESCUE WINDOW
          </span>
          <Badge variant="outline" className={estimate.rescueWindowMinutes < 10 ? 'border-red-500 text-red-400' : ''}>
            {estimate.rescueWindowMinutes} min
          </Badge>
        </div>

        {estimate.collapseTimeSeconds !== Infinity && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div>
                <div className="text-xs text-red-400 font-bold uppercase">COLLAPSE IMMINENT</div>
                <div className="text-lg font-mono text-white">{estimate.collapseTimeSeconds}s estimated</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-[10px] text-muted-foreground border-t border-white/10 pt-2">
          Based on occupancy density, structural damage level, and evacuation time models.
        </div>

      </CardContent>
    </Card>
  );
}
