
import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment } from "@react-three/drei";
import Building3D from "@/components/Building3D";
import { SimControls } from "@/components/SimControls";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useCreateSimulation } from "@/hooks/use-simulations";
import { generateDefaultProperties, useBuildings } from "@/hooks/use-buildings";
import { generateEarthquake, solveStep, calculateDrift, DT } from "@/lib/physics";
import { 
  calculateStructuralDNA, 
  calculateWaveProgression,
  createFreshMemory,
  updateStructuralMemory,
  estimateCasualties,
  generateSensorReadings,
  calculateAgingFactors,
  generateRecommendations,
  generateAftershockSequence,
  createInitialDisasterState,
  updateDisasterState,
  type StructuralMemory,
  type DisasterState,
  type AftershockEvent
} from "@/lib/advanced-physics";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

import { StructuralDNACard } from "@/components/StructuralDNACard";
import { WaveVisualizer } from "@/components/WaveVisualizer";
import { StructuralMemoryPanel } from "@/components/StructuralMemoryPanel";
import { CasualtyEstimator } from "@/components/CasualtyEstimator";
import { SensorPanel } from "@/components/SensorPanel";
import { DecisionEngine } from "@/components/DecisionEngine";
import { AftershockTimeline } from "@/components/AftershockTimeline";
import { MultiDisasterPanel } from "@/components/MultiDisasterPanel";
import { AgingModelPanel } from "@/components/AgingModelPanel";

export default function Simulator() {
  const { toast } = useToast();
  const [params, setParams] = useState({
    magnitude: 7.0,
    duration: 20,
    soilType: 'medium'
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simState, setSimState] = useState({
    displacements: [] as number[],
    velocities: [] as number[],
    accelerations: [] as number[],
    time: 0,
    groundAccel: 0
  });

  const [history, setHistory] = useState<any[]>([]);
  const [earthquakeData, setEarthquakeData] = useState<number[]>([]);
  const [finalMetrics, setFinalMetrics] = useState<{drift: number, safety: number} | null>(null);
  const animationRef = useRef<number>();
  
  const FLOORS = 5;
  const [buildingProps, setBuildingProps] = useState(generateDefaultProperties(FLOORS));
  
  // Advanced features state
  const [buildingAge, setBuildingAge] = useState(10);
  const [structuralMemory, setStructuralMemory] = useState<StructuralMemory>(createFreshMemory());
  const [disasterState, setDisasterState] = useState<DisasterState>(createInitialDisasterState());
  const [aftershocks, setAftershocks] = useState<AftershockEvent[]>([]);
  const [waveProgress, setWaveProgress] = useState(0);
  const [retrofits, setRetrofits] = useState<('none' | 'bracing' | 'damper' | 'concrete-core')[]>(new Array(FLOORS).fill('none'));
  
  const createSimulation = useCreateSimulation();
  const { data: buildings } = useBuildings();

  // Computed values
  const agingFactors = calculateAgingFactors(buildingAge);
  const masses = buildingProps.map(p => p.mass * agingFactors.strengthReduction);
  const stiffnesses = buildingProps.map(p => p.stiffness * agingFactors.stiffnessReduction);
  
  const structuralDNA = calculateStructuralDNA(masses, stiffnesses, buildingAge);
  const waveState = calculateWaveProgression(simState.time, 30, params.magnitude);
  const driftValues = calculateDrift(simState.displacements);
  const maxDrift = Math.max(...driftValues, 0);
  
  // Rule 4: Safety score MUST be inversely proportional to drift, age, and damage.
  const strengthFactor = 1.0; // Standard base
  const stiffnessFactor = 1.0; 
  const agePenalty = Math.min(0.5, buildingAge * 0.01); // Up to 50% penalty for 50yrs
  const damagePenalty = Math.min(0.8, maxDrift * 0.2); // Up to 80% penalty for 4% drift
  const fatiguePenalty = Math.min(0.3, (structuralMemory.fatigueMultiplier - 1) * 0.5);

  const safetyScore = Math.max(0, Math.min(100, 
    100 * strengthFactor * stiffnessFactor * (1 - agePenalty) * (1 - damagePenalty) * (1 - fatiguePenalty)
  ));
  
  const casualtyEstimate = estimateCasualties(maxDrift, FLOORS, 20, buildingAge);
  const sensors = generateSensorReadings(simState.displacements, simState.accelerations, simState.time);
  const recommendations = generateRecommendations(
    finalMetrics ? finalMetrics.drift : maxDrift, 
    finalMetrics ? finalMetrics.safety : safetyScore, 
    structuralMemory, 
    agingFactors
  );

  const metrics = {
    maxDrift: finalMetrics ? finalMetrics.drift : maxDrift,
    safetyScore: finalMetrics ? finalMetrics.safety : safetyScore,
    status: (finalMetrics ? finalMetrics.drift : maxDrift) > 2.5 ? 'Critical' : (finalMetrics ? finalMetrics.drift : maxDrift) > 1.0 ? 'Warning' : 'Safe'
  };

  const damageLevels = driftValues.map(drift => {
    if (drift > 2.5) return 'critical';
    if (drift > 1.0) return 'moderate';
    return 'safe';
  }) as ('safe' | 'moderate' | 'critical')[];

  const handleStart = () => {
    setIsSimulating(true);
    const steps = Math.ceil(params.duration / DT);
    const eq = generateEarthquake(params.magnitude, params.duration, params.soilType, steps);
    setEarthquakeData(eq);
    
    // Generate aftershock sequence
    setAftershocks(generateAftershockSequence(params.magnitude, 24));
    
    // Update disaster state
    setDisasterState(prev => ({
      ...prev,
      earthquake: { active: true, magnitude: params.magnitude }
    }));
    
    setSimState({
      displacements: new Array(FLOORS).fill(0),
      velocities: new Array(FLOORS).fill(0),
      accelerations: new Array(FLOORS).fill(0),
      time: 0,
      groundAccel: 0
    });
    setHistory([]);
    setWaveProgress(0);
    setFinalMetrics(null);

    let step = 0;
    let currentDisp = new Array(FLOORS).fill(0);
    let currentVel = new Array(FLOORS).fill(0);
    let currentAcc = new Array(FLOORS).fill(0);

    const dampings = buildingProps.map(p => (p.damping || 10000) * agingFactors.dampingIncrease);

    const loop = () => {
      if (step >= steps) {
        setIsSimulating(false);
        // Update structural memory after quake
        const finalDrift = Math.max(...calculateDrift(currentDisp), 0);
        
        // Calculate final safety score to freeze it
        const finalAgePenalty = Math.min(0.5, buildingAge * 0.01);
        const finalDamagePenalty = Math.min(0.8, finalDrift * 0.2);
        const finalFatiguePenalty = Math.min(0.3, (structuralMemory.fatigueMultiplier - 1) * 0.5);
        const finalSafety = Math.max(0, Math.min(100, 
          100 * (1 - finalAgePenalty) * (1 - finalDamagePenalty) * (1 - finalFatiguePenalty)
        ));

        setFinalMetrics({ drift: finalDrift, safety: finalSafety });
        setStructuralMemory(prev => updateStructuralMemory(prev, finalDrift * 10, 0));
        setDisasterState(prev => ({
          ...prev,
          earthquake: { active: false, magnitude: 0 }
        }));
        return;
      }

      const ga = eq[step];
      const result = solveStep(masses, stiffnesses, dampings, currentDisp, currentVel, currentAcc, ga);
      
      currentDisp = result.disp;
      currentVel = result.vel;
      currentAcc = result.acc;

      const time = step * DT;
      setSimState({
        displacements: currentDisp,
        velocities: currentVel,
        accelerations: currentAcc,
        time,
        groundAccel: ga
      });

      // Update wave progress
      setWaveProgress(Math.min(time / 5, 1)); // Full wave in 5 seconds

      // Update disaster state
      setDisasterState(prev => updateDisasterState(prev, DT, Math.max(...calculateDrift(currentDisp), 0) * 10));

      if (step % 5 === 0) {
        setHistory(prev => [...prev.slice(-50), {
          time: time.toFixed(1),
          drift: calculateDrift(currentDisp)[0],
          ground: ga.toFixed(2)
        }]);
      }

      step++;
      animationRef.current = requestAnimationFrame(loop);
    };
    
    loop();
  };

  const handleStop = () => {
    setIsSimulating(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setDisasterState(prev => ({
      ...prev,
      earthquake: { active: false, magnitude: 0 }
    }));
  };

  const handleReset = () => {
    handleStop();
    setSimState({
      displacements: new Array(FLOORS).fill(0),
      velocities: new Array(FLOORS).fill(0),
      accelerations: new Array(FLOORS).fill(0),
      time: 0,
      groundAccel: 0
    });
    setHistory([]);
    setWaveProgress(0);
    setFinalMetrics(null);
    setDisasterState(createInitialDisasterState());
  };

  const handleSave = async () => {
    if (isSimulating) return;

    let overallDamage = 'safe';
    if (maxDrift > 1.0) overallDamage = 'moderate';
    if (maxDrift > 2.5) overallDamage = 'critical';
    if (maxDrift > 4.0) overallDamage = 'collapse';

    try {
      await createSimulation.mutateAsync({
        buildingId: 1,
        magnitude: params.magnitude,
        duration: params.duration,
        soilType: params.soilType,
        maxDrift: metrics.maxDrift,
        safetyScore: metrics.safetyScore,
        damageLevel: overallDamage,
        report: `Simulation: M${params.magnitude} on ${params.soilType} soil. Peak drift: ${maxDrift.toFixed(2)}%. Building age: ${buildingAge}yrs. Fatigue: ${structuralMemory.fatigueMultiplier.toFixed(2)}x.`
      });
      toast({
        title: "Report Saved",
        description: "Simulation results archived successfully.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Error Saving",
        description: "Could not save simulation results.",
      });
    }
  };

  const handleTriggerAftershock = (event: AftershockEvent) => {
    setParams(prev => ({
      ...prev,
      magnitude: event.magnitude,
      duration: event.duration
    }));
    toast({
      title: "Aftershock Selected",
      description: `M${event.magnitude} aftershock loaded. Click START to simulate.`,
    });
  };

  const handleToggleFire = (active: boolean) => {
    setDisasterState(prev => ({
      ...prev,
      fire: {
        ...prev.fire,
        active,
        floors: active ? [1] : [],
        intensity: active ? 20 : 0
      }
    }));
  };

  const handleToggleGasLeak = (active: boolean) => {
    setDisasterState(prev => ({
      ...prev,
      gasLeak: {
        ...prev.gasLeak,
        active,
        floor: 2,
        concentration: active ? 500 : 0
      }
    }));
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen md:h-[calc(100vh-2rem)] md:m-4 gap-4">
        
        {/* Top Section: Visualization + Controls */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[400px]">
          
          {/* 3D Viewport */}
          <div className="lg:col-span-7 bg-black/40 rounded-xl overflow-hidden relative border border-border shadow-2xl">
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-primary border border-primary/20">
              VIEWPORT: PERSPECTIVE | AGE: {buildingAge}yrs
            </div>
            
            <Canvas shadows>
              <PerspectiveCamera makeDefault position={[20, 15, 25]} fov={50} />
              <OrbitControls maxPolarAngle={Math.PI / 2} minDistance={10} maxDistance={50} />
              
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 20, 10]} 
                intensity={1} 
                castShadow 
                shadow-mapSize={[1024, 1024]} 
              />
              <Environment preset="city" />

              <Building3D 
                floors={FLOORS} 
                displacements={simState.displacements}
                damageLevels={damageLevels}
                waveProgress={waveProgress}
                fireFloors={disasterState.fire.floors}
                age={buildingAge}
                retrofits={retrofits}
              />
            </Canvas>
          </div>

          {/* Right Panel: Controls + Advanced Features */}
          <div className="lg:col-span-5">
            <Tabs defaultValue="controls" className="h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="controls" data-testid="tab-controls">Control</TabsTrigger>
                <TabsTrigger value="analysis" data-testid="tab-analysis">Analysis</TabsTrigger>
                <TabsTrigger value="disaster" data-testid="tab-disaster">Disaster</TabsTrigger>
                <TabsTrigger value="ai" data-testid="tab-ai">AI Advisor</TabsTrigger>
              </TabsList>
              
              <TabsContent value="controls" className="mt-4">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="space-y-4 pr-4">
                    <SimControls 
                      isSimulating={isSimulating}
                      onStart={handleStart}
                      onStop={handleStop}
                      onReset={handleReset}
                      onSave={handleSave}
                      params={params}
                      setParams={setParams}
                      metrics={metrics}
                    />
                    <AgingModelPanel 
                      age={buildingAge}
                      agingFactors={agingFactors}
                      onAgeChange={setBuildingAge}
                      disabled={isSimulating}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="analysis" className="mt-4">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="space-y-4 pr-4">
                    <StructuralDNACard dna={structuralDNA} />
                    <WaveVisualizer waveState={waveState} time={simState.time} />
                    <StructuralMemoryPanel memory={structuralMemory} />
                    <SensorPanel sensors={sensors} />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="disaster" className="mt-4">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="space-y-4 pr-4">
                    <CasualtyEstimator estimate={casualtyEstimate} />
                    <MultiDisasterPanel 
                      disasterState={disasterState}
                      onToggleFire={handleToggleFire}
                      onToggleGasLeak={handleToggleGasLeak}
                    />
                    <AftershockTimeline 
                      aftershocks={aftershocks}
                      currentTime={simState.time}
                      onTriggerAftershock={handleTriggerAftershock}
                    />
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="ai" className="mt-4">
                <ScrollArea className="h-[calc(100vh-380px)]">
                  <div className="pr-4">
                    <DecisionEngine recommendations={recommendations} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Bottom Section: Analytics Graphs */}
        <div className="h-48 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              INTER-STORY DRIFT (%)
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[0, 3]} stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="drift" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-panel p-4 flex flex-col">
            <h3 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-accent rounded-full"></span>
              GROUND ACCELERATION (g)
            </h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={[-1, 1]} stroke="#94a3b8" fontSize={10} />
                  <Line type="monotone" dataKey="ground" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
