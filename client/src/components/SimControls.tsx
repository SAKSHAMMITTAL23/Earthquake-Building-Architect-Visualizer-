import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlayCircle, StopCircle, RefreshCw, Save } from "lucide-react";
import { Label } from "@/components/ui/label";

interface SimControlsProps {
  isSimulating: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onSave: () => void;
  params: {
    magnitude: number;
    duration: number;
    soilType: string;
  };
  setParams: (params: any) => void;
  metrics: {
    maxDrift: number;
    safetyScore: number;
    status: string;
  };
}

export const SimControls: React.FC<SimControlsProps> = ({ 
  isSimulating, onStart, onStop, onReset, onSave, params, setParams, metrics 
}) => {
  return (
    <Card className="glass-panel border-l-4 border-l-primary h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-mono flex items-center justify-between">
          <span>CONTROL PANEL</span>
          {isSimulating && <span className="text-xs text-primary animate-pulse">● LIVE</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Input Parameters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs uppercase text-muted-foreground">Magnitude (Mw)</Label>
              <span className="font-mono text-sm font-bold text-primary">{params.magnitude.toFixed(1)}</span>
            </div>
            <Slider 
              value={[params.magnitude]} 
              min={5.0} 
              max={9.0} 
              step={0.1}
              onValueChange={([val]) => setParams({...params, magnitude: val})}
              disabled={isSimulating}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs uppercase text-muted-foreground">Duration (s)</Label>
              <span className="font-mono text-sm font-bold">{params.duration}s</span>
            </div>
            <Slider 
              value={[params.duration]} 
              min={10} 
              max={60} 
              step={5}
              onValueChange={([val]) => setParams({...params, duration: val})}
              disabled={isSimulating}
            />
          </div>

          <div className="space-y-2">
             <Label className="text-xs uppercase text-muted-foreground">Soil Conditions</Label>
             <Select 
               value={params.soilType} 
               onValueChange={(val) => setParams({...params, soilType: val})}
               disabled={isSimulating}
             >
               <SelectTrigger className="w-full bg-secondary border-none">
                 <SelectValue placeholder="Select Soil Type" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="rock">Class A: Hard Rock</SelectItem>
                 <SelectItem value="medium">Class C: Dense Soil</SelectItem>
                 <SelectItem value="soft">Class E: Soft Clay</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {!isSimulating ? (
            <Button onClick={onStart} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
              <PlayCircle className="mr-2 h-4 w-4" /> START SIM
            </Button>
          ) : (
             <Button onClick={onStop} variant="destructive" className="w-full font-bold">
              <StopCircle className="mr-2 h-4 w-4" /> STOP
            </Button>
          )}
          
          <Button onClick={onReset} variant="secondary" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> RESET
          </Button>
        </div>

        <div className="pt-2 border-t border-white/10">
            <Button onClick={onSave} variant="outline" className="w-full border-primary/30 hover:bg-primary/10 text-primary">
                <Save className="mr-2 h-4 w-4" /> SAVE REPORT
            </Button>
        </div>

        {/* Real-time Metrics Display */}
        <div className="bg-black/20 rounded-lg p-4 space-y-3 mt-4 tech-border">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">MAX DRIFT</span>
            <span className={`font-mono font-bold ${metrics.maxDrift > 2.5 ? 'text-red-500' : metrics.maxDrift > 1.5 ? 'text-yellow-500' : 'text-green-500'}`}>
              {metrics.maxDrift.toFixed(2)}%
            </span>
          </div>
          <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${metrics.maxDrift > 2.5 ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(metrics.maxDrift * 20, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <span className="text-xs text-muted-foreground">SAFETY SCORE</span>
            <span className="font-mono font-bold text-white">{metrics.safetyScore.toFixed(0)}/100</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
