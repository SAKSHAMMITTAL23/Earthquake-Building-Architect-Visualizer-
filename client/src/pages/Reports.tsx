import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { useSimulations } from "@/hooks/use-simulations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { FileText, Download, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const { data: simulations, isLoading } = useSimulations();

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold font-mono mb-8">SIMULATION REPORTS</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1,2,3].map(i => (
               <div key={i} className="h-48 bg-card/50 animate-pulse rounded-xl" />
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {simulations?.length === 0 && (
               <div className="text-center py-20 text-muted-foreground">
                 No simulations recorded yet. Run your first test in the Simulator.
               </div>
             )}
             
             {simulations?.map((sim) => (
               <Card key={sim.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
                 <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
                   
                   <div className="flex-shrink-0">
                     <div className={`
                       w-12 h-12 rounded-full flex items-center justify-center
                       ${sim.damageLevel === 'safe' ? 'bg-green-500/20 text-green-500' : 
                         sim.damageLevel === 'critical' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}
                     `}>
                       {sim.damageLevel === 'safe' ? <CheckCircle className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                     </div>
                   </div>

                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3 mb-1">
                       <h3 className="font-bold text-lg text-foreground">Simulation #{sim.id}</h3>
                       <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                         {format(new Date(sim.timestamp || new Date()), "MMM d, yyyy HH:mm")}
                       </span>
                     </div>
                     <p className="text-muted-foreground text-sm truncate">
                       Magnitude {sim.magnitude} • {sim.soilType.toUpperCase()} Soil • Duration {sim.duration}s
                     </p>
                   </div>

                   <div className="grid grid-cols-3 gap-8 text-center md:text-right border-t md:border-t-0 border-border pt-4 md:pt-0 w-full md:w-auto">
                     <div>
                       <div className="text-xs text-muted-foreground uppercase">Max Drift</div>
                       <div className={`font-mono font-bold ${sim.maxDrift > 2.0 ? 'text-red-400' : 'text-foreground'}`}>
                         {sim.maxDrift.toFixed(2)}%
                       </div>
                     </div>
                     <div>
                       <div className="text-xs text-muted-foreground uppercase">Safety</div>
                       <div className="font-mono font-bold text-foreground">{sim.safetyScore.toFixed(0)}</div>
                     </div>
                     <div>
                       <div className="text-xs text-muted-foreground uppercase">Result</div>
                       <div className="font-bold uppercase text-xs tracking-wider mt-1">{sim.damageLevel}</div>
                     </div>
                   </div>

                   <div className="flex-shrink-0 md:ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Button variant="ghost" size="icon">
                       <Download className="w-4 h-4" />
                     </Button>
                   </div>

                 </div>
               </Card>
             ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
