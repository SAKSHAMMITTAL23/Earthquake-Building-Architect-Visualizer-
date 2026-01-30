
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity, Gauge, Radio } from "lucide-react";
import type { SensorReading } from "@/lib/advanced-physics";

interface SensorPanelProps {
  sensors: SensorReading[];
}

export function SensorPanel({ sensors }: SensorPanelProps) {
  const statusColors = {
    normal: 'bg-green-500/20 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
  };

  const typeIcons = {
    strain: <Gauge className="h-3 w-3" />,
    acceleration: <Activity className="h-3 w-3" />,
    crack: <Radio className="h-3 w-3" />,
    displacement: <Activity className="h-3 w-3" />
  };

  // Group sensors by type for display
  const sensorsByType = sensors.reduce((acc, s) => {
    if (!acc[s.type]) acc[s.type] = [];
    acc[s.type].push(s);
    return acc;
  }, {} as Record<string, SensorReading[]>);

  return (
    <Card className="glass-panel border-l-4 border-l-cyan-500" data-testid="card-sensor-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          STRUCTURAL NERVOUS SYSTEM
          <Badge variant="outline" className="ml-auto text-[10px]">{sensors.length} SENSORS</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-3">
            {Object.entries(sensorsByType).map(([type, typeSensors]) => (
              <div key={type} className="space-y-1">
                <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                  {typeIcons[type as keyof typeof typeIcons]}
                  {type.toUpperCase()} SENSORS
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {typeSensors.map(sensor => (
                    <div 
                      key={sensor.id}
                      className={`rounded p-1.5 text-center text-[10px] border ${statusColors[sensor.status]}`}
                    >
                      <div className="font-mono font-bold">{sensor.value.toFixed(1)}</div>
                      <div className="text-[8px] opacity-70">F{sensor.floor}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2 mt-3 pt-2 border-t border-white/10">
          <div className="flex items-center gap-1 text-[10px]">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Normal
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Warning
          </div>
          <div className="flex items-center gap-1 text-[10px]">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Critical
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
