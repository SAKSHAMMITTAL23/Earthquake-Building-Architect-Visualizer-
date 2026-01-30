
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Flame, Wind, AlertTriangle, Zap } from "lucide-react";
import type { DisasterState } from "@/lib/advanced-physics";

interface MultiDisasterPanelProps {
  disasterState: DisasterState;
  onToggleFire: (active: boolean) => void;
  onToggleGasLeak: (active: boolean) => void;
}

export function MultiDisasterPanel({ disasterState, onToggleFire, onToggleGasLeak }: MultiDisasterPanelProps) {
  const riskColor = disasterState.compoundRisk > 70 ? 'text-red-400' : 
                    disasterState.compoundRisk > 40 ? 'text-orange-400' : 
                    disasterState.compoundRisk > 20 ? 'text-yellow-400' : 'text-green-400';

  return (
    <Card className="glass-panel border-l-4 border-l-orange-600" data-testid="card-multi-disaster">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          MULTI-DISASTER MODE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Compound Risk Meter */}
        <div className="bg-black/30 rounded p-3 text-center">
          <div className={`text-3xl font-mono font-bold ${riskColor}`}>
            {disasterState.compoundRisk.toFixed(0)}%
          </div>
          <div className="text-[10px] text-muted-foreground uppercase">Compound Risk Index</div>
          <Progress value={disasterState.compoundRisk} className="h-1.5 mt-2" />
        </div>

        <div className="space-y-3">
          {/* Earthquake Status */}
          <div className={`flex items-center justify-between p-2 rounded ${disasterState.earthquake.active ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-black/20'}`}>
            <div className="flex items-center gap-2">
              <Zap className={`h-4 w-4 ${disasterState.earthquake.active ? 'text-cyan-400' : 'text-muted-foreground'}`} />
              <span className="text-sm">Earthquake</span>
            </div>
            {disasterState.earthquake.active ? (
              <Badge className="bg-cyan-500/20 text-cyan-400">M{disasterState.earthquake.magnitude}</Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">INACTIVE</Badge>
            )}
          </div>

          {/* Fire Toggle */}
          <div className={`flex items-center justify-between p-2 rounded ${disasterState.fire.active ? 'bg-red-500/10 border border-red-500/30' : 'bg-black/20'}`}>
            <div className="flex items-center gap-2">
              <Flame className={`h-4 w-4 ${disasterState.fire.active ? 'text-red-400 animate-pulse' : 'text-muted-foreground'}`} />
              <div>
                <span className="text-sm">Fire</span>
                {disasterState.fire.active && (
                  <div className="text-[10px] text-red-400">
                    Floors: {disasterState.fire.floors.join(', ')} | {disasterState.fire.intensity.toFixed(0)}% intensity
                  </div>
                )}
              </div>
            </div>
            <Switch 
              checked={disasterState.fire.active} 
              onCheckedChange={onToggleFire}
              data-testid="switch-fire"
            />
          </div>

          {/* Gas Leak Toggle */}
          <div className={`flex items-center justify-between p-2 rounded ${disasterState.gasLeak.active ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-black/20'}`}>
            <div className="flex items-center gap-2">
              <Wind className={`h-4 w-4 ${disasterState.gasLeak.active ? 'text-yellow-400' : 'text-muted-foreground'}`} />
              <div>
                <span className="text-sm">Gas Leak</span>
                {disasterState.gasLeak.active && (
                  <div className="text-[10px] text-yellow-400">
                    Floor {disasterState.gasLeak.floor} | {disasterState.gasLeak.concentration.toFixed(0)} ppm
                  </div>
                )}
              </div>
            </div>
            <Switch 
              checked={disasterState.gasLeak.active} 
              onCheckedChange={onToggleGasLeak}
              data-testid="switch-gas-leak"
            />
          </div>
        </div>

        {disasterState.gasLeak.explosionRisk > 50 && (
          <div className="bg-red-500/20 border border-red-500/50 rounded p-2 animate-pulse">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-bold">EXPLOSION RISK: {disasterState.gasLeak.explosionRisk.toFixed(0)}%</span>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
