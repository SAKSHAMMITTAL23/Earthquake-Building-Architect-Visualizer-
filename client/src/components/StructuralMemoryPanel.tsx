
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, History, TrendingUp, AlertCircle } from "lucide-react";
import type { StructuralMemory } from "@/lib/advanced-physics";

interface StructuralMemoryPanelProps {
  memory: StructuralMemory;
}

export function StructuralMemoryPanel({ memory }: StructuralMemoryPanelProps) {
  const fatigueLevel = memory.fatigueMultiplier > 2 ? 'critical' : memory.fatigueMultiplier > 1.5 ? 'high' : 'normal';
  
  return (
    <Card className="glass-panel border-l-4 border-l-amber-500" data-testid="card-structural-memory">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Brain className="h-4 w-4 text-amber-400" />
          STRUCTURAL MEMORY SYSTEM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded p-2 text-center">
            <History className="h-4 w-4 mx-auto mb-1 text-amber-400" />
            <div className="text-lg font-mono font-bold">{memory.previousQuakes}</div>
            <div className="text-[10px] text-muted-foreground">PAST QUAKES</div>
          </div>
          
          <div className="bg-black/30 rounded p-2 text-center">
            <TrendingUp className="h-4 w-4 mx-auto mb-1 text-amber-400" />
            <div className="text-lg font-mono font-bold">{memory.fatigueMultiplier.toFixed(2)}x</div>
            <div className="text-[10px] text-muted-foreground">FATIGUE MULT.</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">ACCUMULATED DAMAGE</span>
            <span className="font-mono text-sm text-amber-400">{memory.totalDamageHistory.toFixed(1)}%</span>
          </div>
          <Progress 
            value={memory.totalDamageHistory} 
            className="h-2"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">RESIDUAL DRIFT</span>
            <span className="font-mono text-sm">{memory.residualDrift.toFixed(2)}%</span>
          </div>
        </div>

        {memory.totalDamageHistory > 30 && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-2 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200">
              <strong>Material Fatigue Detected:</strong> Structure has "memory" of past damage. 
              Same force will now cause {((memory.fatigueMultiplier - 1) * 100).toFixed(0)}% more damage.
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
