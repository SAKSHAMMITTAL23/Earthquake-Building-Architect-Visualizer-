import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Hammer, ShieldCheck, ArrowRight } from "lucide-react";
import { generateDefaultProperties } from "@/hooks/use-buildings";
import { useToast } from "@/hooks/use-toast";

export default function RetrofitLab() {
  const { toast } = useToast();
  const FLOORS = 5;
  const [properties, setProperties] = useState(generateDefaultProperties(FLOORS).map(p => ({
    ...p,
    reinforcement: 'none' as 'none' | 'bracing' | 'damper' | 'concrete-core',
    thickness: 1.0
  })));

  const handleStiffnessChange = (floorIndex: number, newVal: number) => {
    const newProps = [...properties];
    newProps[floorIndex] = { ...newProps[floorIndex], stiffness: newVal };
    setProperties(newProps);
  };

  const handleReinforcementChange = (floorIndex: number, type: any) => {
    const newProps = [...properties];
    newProps[floorIndex] = { ...newProps[floorIndex], reinforcement: type };
    setProperties(newProps);
  };

  const handleApplyRetrofit = () => {
    // Apply changes to session
    toast({
      title: "Retrofit Strategy Saved",
      description: "Structural reinforcements (Bracing, Core, Dampers) are ready for testing in the Simulator.",
    });
  };

  const calculateCost = () => {
    return properties.reduce((acc, p) => {
      let base = (p.stiffness / 1000000) * 1000;
      if (p.reinforcement === 'bracing') base += 15000;
      if (p.reinforcement === 'damper') base += 35000;
      if (p.reinforcement === 'concrete-core') base += 75000;
      return acc + base;
    }, 0);
  };

  const calculateSafetyScore = () => {
    const avgStiffness = properties.reduce((acc, p) => acc + p.stiffness, 0) / properties.length;
    const reinforcementCount = properties.filter(p => p.reinforcement !== 'none').length;
    const baseScore = Math.min(100, (avgStiffness / 100000000) * 40);
    const reinforcementBonus = (reinforcementCount / properties.length) * 60;
    const score = baseScore + reinforcementBonus;
    
    if (score > 90) return { label: 'A+', color: 'text-green-500' };
    if (score > 80) return { label: 'A', color: 'text-green-400' };
    if (score > 70) return { label: 'B', color: 'text-yellow-500' };
    if (score > 60) return { label: 'C', color: 'text-orange-500' };
    return { label: 'D', color: 'text-red-500' };
  };

  const safety = calculateSafetyScore();

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-mono">RETROFIT LABORATORY</h1>
            <p className="text-muted-foreground mt-2">Modify structural properties to improve seismic performance.</p>
            <div className="mt-4 flex gap-4">
              <div className="bg-secondary/50 px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block">ESTIMATED BUDGET</span>
                <span className="text-xl font-bold text-primary">${calculateCost().toLocaleString()}</span>
              </div>
              <div className="bg-secondary/50 px-4 py-2 rounded-lg border border-border">
                <span className="text-xs text-muted-foreground block">SAFETY RATING</span>
                <span className="text-xl font-bold text-green-500"><span className={safety.color}>{safety.label}</span></span>
              </div>
            </div>
          </div>
          <Button onClick={handleApplyRetrofit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <ShieldCheck className="mr-2 h-4 w-4" /> APPLY CHANGES
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Visual Editor (Abstract) */}
          <Card className="glass-panel border-l-4 border-l-accent">
            <CardHeader>
              <CardTitle>Structure Profile</CardTitle>
              <CardDescription>Adjust stiffness per floor (Shear Walls / Bracing)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reversed to show top floor at top visually */}
              {[...properties].reverse().map((prop, idx) => {
                 const realIndex = FLOORS - 1 - idx;
                 return (
                   <div key={realIndex} className="flex items-center gap-4 bg-secondary/30 p-4 rounded-lg border border-white/5">
                     <div className="w-16 flex flex-col items-center justify-center bg-background/50 rounded p-2">
                       <span className="text-xs text-muted-foreground">FLOOR</span>
                       <span className="text-xl font-bold">{realIndex + 1}</span>
                     </div>
                     
                     <div className="flex-1 space-y-4">
                       <div className="flex justify-between text-sm">
                         <span className="font-medium text-foreground">Structural Integrity</span>
                         <span className="font-mono text-primary">{(prop.stiffness / 1000000).toFixed(1)} MN/m</span>
                       </div>
                       <Slider 
                         value={[prop.stiffness]}
                         min={50000000}
                         max={200000000}
                         step={5000000}
                         onValueChange={([val]) => handleStiffnessChange(realIndex, val)}
                         className="py-1"
                       />
                       
                       <div className="grid grid-cols-2 gap-2 mt-2">
                         <Button 
                           variant={prop.reinforcement === 'bracing' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleReinforcementChange(realIndex, 'bracing')}
                           className="text-[10px] h-7"
                         >
                           X-Bracing
                         </Button>
                         <Button 
                           variant={prop.reinforcement === 'damper' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleReinforcementChange(realIndex, 'damper')}
                           className="text-[10px] h-7"
                         >
                           Viscous Damper
                         </Button>
                         <Button 
                           variant={prop.reinforcement === 'concrete-core' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleReinforcementChange(realIndex, 'concrete-core')}
                           className="text-[10px] h-7"
                         >
                           Shear Core
                         </Button>
                         <Button 
                           variant={prop.reinforcement === 'none' ? 'default' : 'outline'}
                           size="sm"
                           onClick={() => handleReinforcementChange(realIndex, 'none')}
                           className="text-[10px] h-7"
                         >
                           Base Only
                         </Button>
                       </div>
                     </div>
                   </div>
                 );
              })}
            </CardContent>
          </Card>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="bg-card/50 border border-border">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Hammer className="h-5 w-5 text-accent" />
                   Retrofit Strategies
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4 text-sm text-muted-foreground">
                 <p>
                   <strong className="text-foreground">Shear Walls:</strong> Adding reinforced concrete walls increases lateral stiffness significantly, reducing drift but potentially increasing base shear forces.
                 </p>
                 <p>
                   <strong className="text-foreground">Braced Frames:</strong> Steel diagonal members (X-bracing) provide stiffness and strength while adding less mass than concrete walls.
                 </p>
                 <p>
                   <strong className="text-foreground">Base Isolation:</strong> (Advanced) Decoupling the building from the ground motion to reduce accelerations transmitted to the superstructure.
                 </p>
               </CardContent>
            </Card>

            <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
               <h3 className="text-lg font-bold text-primary mb-2">Simulation Tip</h3>
               <p className="text-sm opacity-80">
                 Soft story mechanisms often occur at the ground floor (Floor 1). Try increasing the stiffness of Floor 1 by 50% and observe if the collapse mechanism changes in the next simulation run.
               </p>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
