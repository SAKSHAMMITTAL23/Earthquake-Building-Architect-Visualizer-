import { useState } from "react";
import { useFloors } from "@/hooks/use-floors";
import { BuildingViewer } from "@/components/BuildingViewer";
import { Sidebar } from "@/components/Sidebar";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: floors, isLoading, isError, refetch } = useFloors();
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background text-muted-foreground space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-medium animate-pulse">Loading Engineering Simulation...</p>
      </div>
    );
  }

  if (isError || !floors) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-background space-y-6 p-8 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Simulation Error</h1>
          <p className="text-muted-foreground mt-2 max-w-md">
            Failed to load building data. The server might be unreachable or the data is corrupt.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="lg">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-screen overflow-hidden flex flex-col md:flex-row bg-background bg-grid-pattern">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-[400px] h-[40vh] md:h-full shrink-0 relative order-2 md:order-1">
        <Sidebar 
          floors={floors} 
          selectedFloorId={selectedFloorId} 
          onSelectFloor={setSelectedFloorId} 
        />
      </aside>

      {/* 3D Viewport */}
      <main className="flex-1 h-[60vh] md:h-full p-4 md:p-6 relative order-1 md:order-2">
        <header className="absolute top-8 left-8 z-10 pointer-events-none">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            Structure <span className="text-primary">Sim</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Engineering Environment
          </p>
        </header>
        
        <BuildingViewer 
          floors={floors} 
          selectedFloorId={selectedFloorId} 
          onSelectFloor={setSelectedFloorId} 
        />
      </main>
    </div>
  );
}
