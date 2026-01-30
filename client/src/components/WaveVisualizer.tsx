
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Waves, Radio } from "lucide-react";
import type { WaveState } from "@/lib/advanced-physics";

interface WaveVisualizerProps {
  waveState: WaveState;
  time: number;
}

export function WaveVisualizer({ waveState, time }: WaveVisualizerProps) {
  return (
    <Card className="glass-panel" data-testid="card-wave-visualizer">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Radio className="h-4 w-4 text-cyan-400" />
          SEISMIC WAVE PROPAGATION
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-cyan-400 font-mono">P-WAVE (Primary)</span>
            <span className="text-xs font-mono">{(waveState.pWave.position * 100).toFixed(0)}%</span>
          </div>
          <div className="relative h-3 bg-black/40 rounded overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-100"
              style={{ width: `${waveState.pWave.position * 100}%` }}
            />
            {waveState.pWave.position > 0 && waveState.pWave.position < 1 && (
              <div 
                className="absolute h-full w-2 bg-white animate-pulse"
                style={{ left: `${waveState.pWave.position * 100}%` }}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Velocity: 6.0 km/s | Compressional</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-orange-400 font-mono">S-WAVE (Secondary)</span>
            <span className="text-xs font-mono">{(waveState.sWave.position * 100).toFixed(0)}%</span>
          </div>
          <div className="relative h-3 bg-black/40 rounded overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-100"
              style={{ width: `${waveState.sWave.position * 100}%` }}
            />
            {waveState.sWave.position > 0 && waveState.sWave.position < 1 && (
              <div 
                className="absolute h-full w-2 bg-white animate-pulse"
                style={{ left: `${waveState.sWave.position * 100}%` }}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Velocity: 3.5 km/s | Shear</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs text-red-400 font-mono">SURFACE WAVE</span>
            <span className="text-xs font-mono">{(waveState.surfaceWave.position * 100).toFixed(0)}%</span>
          </div>
          <div className="relative h-3 bg-black/40 rounded overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-100"
              style={{ width: `${waveState.surfaceWave.position * 100}%` }}
            />
            {waveState.surfaceWave.position > 0 && waveState.surfaceWave.position < 1 && (
              <div 
                className="absolute h-full w-2 bg-white animate-pulse"
                style={{ left: `${waveState.surfaceWave.position * 100}%` }}
              />
            )}
          </div>
          <p className="text-[10px] text-muted-foreground">Velocity: 2.5 km/s | Most destructive</p>
        </div>

        <div className={`text-center py-2 rounded font-mono text-xs ${waveState.buildingReached ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
          {waveState.buildingReached ? 'WAVES REACHED STRUCTURE' : 'WAVES EN ROUTE...'}
        </div>

      </CardContent>
    </Card>
  );
}
