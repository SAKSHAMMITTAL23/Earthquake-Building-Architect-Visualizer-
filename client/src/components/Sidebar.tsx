import { useState, useEffect } from "react";
import { type Floor, type InsertFloor } from "@shared/schema";
import { useCreateFloor, useUpdateFloor, useDeleteFloor } from "@/hooks/use-floors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, Trash2, Box, Layers, Palette } from "lucide-react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  floors: Floor[];
  selectedFloorId: number | null;
  onSelectFloor: (id: number | null) => void;
}

const colorOptions = [
  "#e0e0e0", "#ef4444", "#f97316", "#f59e0b", "#84cc16", 
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", 
  "#d946ef", "#f43f5e", "#78716c"
];

export function Sidebar({ floors, selectedFloorId, onSelectFloor }: SidebarProps) {
  const { toast } = useToast();
  const createFloor = useCreateFloor();
  const updateFloor = useUpdateFloor();
  const deleteFloor = useDeleteFloor();

  // Find the currently selected floor object
  const selectedFloor = floors.find(f => f.id === selectedFloorId);

  // Local state for the form to avoid jerky inputs
  const [formData, setFormData] = useState<Partial<InsertFloor>>({});

  // Sync local state when selection changes
  useEffect(() => {
    if (selectedFloor) {
      setFormData({
        label: selectedFloor.label,
        height: selectedFloor.height,
        width: selectedFloor.width,
        depth: selectedFloor.depth,
        color: selectedFloor.color,
        floorNumber: selectedFloor.floorNumber
      });
    }
  }, [selectedFloor]);

  const handleCreate = async () => {
    try {
      // Find next floor number
      const maxFloor = Math.max(0, ...floors.map(f => f.floorNumber));
      const nextNum = maxFloor + 1;
      
      const newFloor: InsertFloor = {
        floorNumber: nextNum,
        label: `Floor ${nextNum}`,
        height: 3.0,
        width: 15.0,
        depth: 15.0,
        color: "#e0e0e0"
      };

      const created = await createFloor.mutateAsync(newFloor);
      onSelectFloor(created.id); // Select the new floor immediately
      
      toast({
        title: "Floor Added",
        description: `Floor ${nextNum} created successfully.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedFloorId) return;
    try {
      await deleteFloor.mutateAsync(selectedFloorId);
      onSelectFloor(null);
      toast({
        title: "Floor Deleted",
        description: "The floor was removed from the building.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (err as Error).message,
      });
    }
  };

  const handleUpdate = (updates: Partial<InsertFloor>) => {
    if (!selectedFloorId) return;
    
    // Optimistically update local state for smooth UI
    setFormData(prev => ({ ...prev, ...updates }));

    // Debounce the actual API call or just call it (React Query handles rapid updates well usually, but debouncing is safer for sliders)
    // For simplicity in this generator, we'll trigger it directly but you might want to debounce in prod.
    // We will just fire it.
    updateFloor.mutate({ id: selectedFloorId, ...updates });
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-card border-r border-border shadow-xl z-10 w-full max-w-sm">
      <div className="p-6 border-b border-border bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-black">
        <h2 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
          Building Spec
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Configure structural elements</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/30 p-4 rounded-xl border border-secondary">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Floors</span>
              <div className="text-2xl font-mono font-bold text-foreground mt-1">{floors.length}</div>
            </div>
            <div className="bg-secondary/30 p-4 rounded-xl border border-secondary">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Height</span>
              <div className="text-2xl font-mono font-bold text-foreground mt-1">
                {floors.reduce((acc, f) => acc + f.height, 0).toFixed(1)}m
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Area */}
          {!selectedFloor ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium">No Floor Selected</h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  Select a floor from the 3D view to edit properties, or create a new one.
                </p>
              </div>
              <Button 
                onClick={handleCreate} 
                disabled={createFloor.isPending}
                className="mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                {createFloor.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add New Floor
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Box className="w-5 h-5 text-primary" />
                  Edit Floor #{selectedFloor.floorNumber}
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onSelectFloor(null)}
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={formData.label || ""} 
                    onChange={(e) => handleUpdate({ label: e.target.value })}
                    className="font-medium"
                  />
                </div>

                {/* Dimensions */}
                <div className="space-y-4 bg-secondary/20 p-4 rounded-xl border border-border/50">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Height (m)</Label>
                      <span className="text-xs font-mono">{formData.height}m</span>
                    </div>
                    <Slider 
                      value={[formData.height || 3]} 
                      min={1} max={10} step={0.1}
                      onValueChange={([val]) => handleUpdate({ height: val })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Width (m)</Label>
                      <span className="text-xs font-mono">{formData.width}m</span>
                    </div>
                    <Slider 
                      value={[formData.width || 15]} 
                      min={5} max={50} step={0.5}
                      onValueChange={([val]) => handleUpdate({ width: val })}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-xs uppercase text-muted-foreground font-bold">Depth (m)</Label>
                      <span className="text-xs font-mono">{formData.depth}m</span>
                    </div>
                    <Slider 
                      value={[formData.depth || 15]} 
                      min={5} max={50} step={0.5}
                      onValueChange={([val]) => handleUpdate({ depth: val })}
                    />
                  </div>
                </div>

                {/* Color Picker */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Material Color
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => handleUpdate({ color: c })}
                        className={`
                          w-8 h-8 rounded-full border-2 transition-transform hover:scale-110
                          ${formData.color === c ? "border-primary scale-110 shadow-md" : "border-transparent"}
                        `}
                        style={{ backgroundColor: c }}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button 
                  onClick={handleCreate} 
                  variant="outline"
                  disabled={createFloor.isPending}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Above
                </Button>
                <Button 
                  onClick={handleDelete} 
                  variant="destructive"
                  disabled={deleteFloor.isPending}
                  className="flex-1"
                >
                  {deleteFloor.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
