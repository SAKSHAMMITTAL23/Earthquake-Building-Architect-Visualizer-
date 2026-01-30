
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dna, Activity, AlertTriangle, Waves } from "lucide-react";
import type { StructuralDNA } from "@/lib/advanced-physics";

interface StructuralDNACardProps {
  dna: StructuralDNA;
}

export function StructuralDNACard({ dna }: StructuralDNACardProps) {
  const fragilityColors = {
    brittle: 'bg-red-500/20 text-red-400 border-red-500/30',
    ductile: 'bg-green-500/20 text-green-400 border-green-500/30',
    'semi-ductile': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  };

  return (
    <Card className="glass-panel border-l-4 border-l-purple-500" data-testid="card-structural-dna">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Dna className="h-4 w-4 text-purple-400" />
          STRUCTURAL DNA PROFILE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" />
              FLEXIBILITY INDEX
            </span>
            <span className="font-mono text-sm font-bold text-purple-400">{dna.flexibilityIndex}</span>
          </div>
          <Progress value={dna.flexibilityIndex} className="h-1.5" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">FRAGILITY TYPE</span>
          <Badge className={fragilityColors[dna.fragilityType]} variant="outline">
            {dna.fragilityType.toUpperCase()}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Waves className="h-3 w-3" />
            RESONANCE
          </span>
          <span className="font-mono text-sm">{dna.resonanceSensitivity} Hz</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">NATURAL PERIOD</span>
          <span className="font-mono text-sm">{dna.naturalPeriod}s</span>
        </div>

        <div className="bg-black/30 rounded p-3 mt-3 border border-purple-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {dna.failurePersonality}
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
