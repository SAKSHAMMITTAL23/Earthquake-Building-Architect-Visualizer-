
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle } from "lucide-react";
import type { AgingFactors } from "@/lib/advanced-physics";

interface AgingModelPanelProps {
  age: number;
  agingFactors: AgingFactors;
  onAgeChange: (age: number) => void;
  disabled?: boolean;
}

export function AgingModelPanel({ age, agingFactors, onAgeChange, disabled }: AgingModelPanelProps) {
  const corrosionColors = {
    none: 'bg-green-500/20 text-green-400 border-green-500/30',
    mild: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    moderate: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    severe: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <Card className="glass-panel border-l-4 border-l-gray-500" data-testid="card-aging-model">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400" />
          STRUCTURE AGING MODEL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">BUILDING AGE</span>
            <span className="font-mono text-lg font-bold">{age} years</span>
          </div>
          <Slider 
            value={[age]} 
            min={0} 
            max={100} 
            step={5}
            onValueChange={([val]) => onAgeChange(val)}
            disabled={disabled}
            className="py-2"
            data-testid="slider-building-age"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>New</span>
            <span>30 yrs</span>
            <span>60 yrs</span>
            <span>100 yrs</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">CORROSION LEVEL</span>
          <Badge className={corrosionColors[agingFactors.corrosionLevel]} variant="outline">
            {agingFactors.corrosionLevel.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded p-2 text-center">
            <div className="text-sm font-mono font-bold text-blue-400">
              {(agingFactors.strengthReduction * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground">Strength</div>
          </div>
          <div className="bg-black/30 rounded p-2 text-center">
            <div className="text-sm font-mono font-bold text-purple-400">
              {(agingFactors.stiffnessReduction * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] text-muted-foreground">Stiffness</div>
          </div>
        </div>

        <div className="bg-black/20 rounded p-2 text-xs text-muted-foreground">
          {agingFactors.description}
        </div>

        {agingFactors.corrosionLevel === 'severe' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-2 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="text-xs text-red-300">
              Critical aging detected. Structural capacity significantly reduced.
            </span>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
