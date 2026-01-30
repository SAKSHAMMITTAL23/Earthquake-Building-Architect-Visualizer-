
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Clock } from "lucide-react";
import type { AftershockEvent } from "@/lib/advanced-physics";

interface AftershockTimelineProps {
  aftershocks: AftershockEvent[];
  currentTime: number; // seconds since main shock
  onTriggerAftershock?: (event: AftershockEvent) => void;
}

export function AftershockTimeline({ aftershocks, currentTime, onTriggerAftershock }: AftershockTimelineProps) {
  const formatTime = (seconds: number) => {
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  return (
    <Card className="glass-panel border-l-4 border-l-orange-500" data-testid="card-aftershock-timeline">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-400" />
          AFTERSHOCK SEQUENCE
          <Badge variant="outline" className="ml-auto">{aftershocks.length} expected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-orange-500/30" />
          
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {aftershocks.slice(0, 8).map((event, idx) => {
              const isPast = currentTime > event.time;
              const isUpcoming = currentTime <= event.time && currentTime > event.time - 60;
              
              return (
                <div 
                  key={idx}
                  className={`relative pl-8 py-1 ${isPast ? 'opacity-50' : ''} ${isUpcoming ? 'animate-pulse' : ''}`}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-1.5 top-2 w-3 h-3 rounded-full border-2 ${
                    isPast ? 'bg-gray-500 border-gray-400' : 
                    isUpcoming ? 'bg-orange-500 border-orange-300' : 
                    'bg-orange-500/50 border-orange-500'
                  }`} />
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold">M{event.magnitude}</span>
                        <span className="text-xs text-muted-foreground">{event.duration.toFixed(0)}s duration</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        T+{formatTime(event.time)}
                      </div>
                    </div>
                    
                    {!isPast && onTriggerAftershock && (
                      <button 
                        onClick={() => onTriggerAftershock(event)}
                        className="text-[10px] px-2 py-1 bg-orange-500/20 hover:bg-orange-500/40 rounded text-orange-400 transition-colors"
                      >
                        SIMULATE
                      </button>
                    )}
                    
                    {isPast && (
                      <Badge variant="outline" className="text-[10px] bg-gray-500/20 text-gray-400">
                        OCCURRED
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="text-[10px] text-muted-foreground mt-3 pt-2 border-t border-white/10">
          Generated using modified Omori's Law and Bath's Law
        </div>
      </CardContent>
    </Card>
  );
}
