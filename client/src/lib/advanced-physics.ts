
// Advanced Physics Engine for Structural Digital Twin
import { G, DT } from './physics';

// ============================================
// 1. STRUCTURAL DNA PROFILE
// ============================================
export interface StructuralDNA {
  flexibilityIndex: number;      // 0-100 (higher = more flexible)
  fragilityType: 'brittle' | 'ductile' | 'semi-ductile';
  resonanceSensitivity: number;  // Hz - natural frequency
  failurePersonality: string;    // Description
  naturalPeriod: number;         // seconds
}

export function calculateStructuralDNA(
  masses: number[],
  stiffnesses: number[],
  age: number
): StructuralDNA {
  const n = masses.length;
  const totalMass = masses.reduce((a, b) => a + b, 0);
  const avgStiffness = stiffnesses.reduce((a, b) => a + b, 0) / n;
  
  // Natural frequency approximation (simplified)
  // Higher stiffness -> higher frequency -> lower period
  const omega = Math.sqrt(avgStiffness / (totalMass / n));
  const naturalPeriod = (2 * Math.PI) / omega;
  const resonanceHz = 1 / naturalPeriod;
  
  // Rule 2: Low stiffness structures should sway more (higher period)
  const flexibilityIndex = Math.min(100, naturalPeriod * 30);
  
  // Rule 1: Aging model affects fragility
  const stiffnessVariance = calculateVariance(stiffnesses);
  const ageFactor = Math.min(1, age / 100); // Normalized to 100 years
  
  let fragilityType: 'brittle' | 'ductile' | 'semi-ductile' = 'ductile';
  // Older buildings become more brittle
  if (ageFactor > 0.5 || stiffnessVariance > 0.4) fragilityType = 'brittle';
  else if (ageFactor > 0.25) fragilityType = 'semi-ductile';
  
  const personalities = {
    brittle: "Brittle profile: Sudden failure risk due to aging or stiffness irregularities.",
    ductile: "Ductile profile: High energy dissipation. Visible warnings before failure.",
    'semi-ductile': "Semi-ductile: Mixed response. Some elements may fail abruptly."
  };
  
  return {
    flexibilityIndex: Math.round(flexibilityIndex),
    fragilityType,
    resonanceSensitivity: Math.round(resonanceHz * 100) / 100,
    failurePersonality: personalities[fragilityType],
    naturalPeriod: Math.round(naturalPeriod * 100) / 100
  };
}

// ============================================
// 2. EARTHQUAKE WAVE TYPES
// ============================================
export interface WaveState {
  pWave: { position: number; amplitude: number };
  sWave: { position: number; amplitude: number };
  surfaceWave: { position: number; amplitude: number };
  buildingReached: boolean;
}

export function calculateWaveProgression(
  time: number,
  epicenterDistance: number = 50, // km
  magnitude: number
): WaveState {
  // Wave velocities (km/s)
  const vP = 6.0;  // P-wave velocity
  const vS = 3.5;  // S-wave velocity
  const vSurface = 2.5; // Surface wave velocity
  
  const pArrival = epicenterDistance / vP;
  const sArrival = epicenterDistance / vS;
  const surfaceArrival = epicenterDistance / vSurface;
  
  const pPos = Math.max(0, (time - 0) * vP);
  const sPos = Math.max(0, (time - 0) * vS);
  const surfacePos = Math.max(0, (time - 0) * vSurface);
  
  const amplitudeFactor = 0.1 * Math.pow(10, 0.3 * (magnitude - 5));
  
  return {
    pWave: { 
      position: Math.min(pPos / epicenterDistance, 1), 
      amplitude: amplitudeFactor * 0.3 
    },
    sWave: { 
      position: Math.min(sPos / epicenterDistance, 1), 
      amplitude: amplitudeFactor * 0.8 
    },
    surfaceWave: { 
      position: Math.min(surfacePos / epicenterDistance, 1), 
      amplitude: amplitudeFactor * 1.0 
    },
    buildingReached: pPos >= epicenterDistance
  };
}

// ============================================
// 3. STRUCTURAL MEMORY SYSTEM
// ============================================
export interface StructuralMemory {
  totalDamageHistory: number;     // Cumulative damage 0-100
  fatigueMultiplier: number;      // Increases with each quake
  previousQuakes: number;
  residualDrift: number;          // Permanent deformation %
  healingFactor: number;          // Time-based partial recovery
}

export function updateStructuralMemory(
  currentMemory: StructuralMemory,
  newDamagePercent: number,
  timeSinceLastQuake: number = 0 // hours
): StructuralMemory {
  // Some "healing" over time (very slow)
  const healingRate = 0.001 * Math.min(timeSinceLastQuake, 1000);
  const healedDamage = currentMemory.totalDamageHistory * (1 - healingRate);
  
  // Accumulate new damage
  const newTotal = Math.min(100, healedDamage + newDamagePercent * currentMemory.fatigueMultiplier);
  
  // Fatigue increases with each earthquake
  const newFatigue = currentMemory.fatigueMultiplier * (1 + newDamagePercent / 100);
  
  return {
    totalDamageHistory: newTotal,
    fatigueMultiplier: Math.min(newFatigue, 3.0), // Cap at 3x
    previousQuakes: currentMemory.previousQuakes + 1,
    residualDrift: currentMemory.residualDrift + newDamagePercent * 0.1,
    healingFactor: healingRate
  };
}

export function createFreshMemory(): StructuralMemory {
  return {
    totalDamageHistory: 0,
    fatigueMultiplier: 1.0,
    previousQuakes: 0,
    residualDrift: 0,
    healingFactor: 0
  };
}

// ============================================
// 4. LIFE-LOSS PROBABILITY ESTIMATOR
// ============================================
export interface CasualtyEstimate {
  casualtyRiskPercent: number;
  rescueWindowMinutes: number;
  collapseTimeSeconds: number;
  occupancyAtRisk: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function estimateCasualties(
  maxDrift: number,
  floors: number,
  occupancyPerFloor: number = 20,
  age: number = 0
): CasualtyEstimate {
  const totalOccupancy = floors * occupancyPerFloor;
  
  // Rule 5 & 6: Casualty risk must increase with drift and structural age
  let collapseTime = Infinity;
  if (maxDrift > 4.0) collapseTime = 15; // Faster collapse for high drift
  else if (maxDrift > 3.0) collapseTime = 60;
  else if (maxDrift > 2.5) collapseTime = 180;
  
  // Rule 6: Old + high drift = high risk
  const ageFactor = age / 100; 
  let baseRisk = 0;
  if (maxDrift < 1.0) baseRisk = 0;
  else if (maxDrift < 2.5) baseRisk = 10 + (ageFactor * 20);
  else if (maxDrift < 4.0) baseRisk = 40 + (ageFactor * 40);
  else baseRisk = 85 + (ageFactor * 15);
  
  const casualtyRisk = Math.min(100, baseRisk);
  const rescueWindow = maxDrift > 2.5 ? Math.max(2, 20 - (maxDrift * 3) - (ageFactor * 10)) : 60;
  
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (casualtyRisk > 75) severity = 'critical';
  else if (casualtyRisk > 45) severity = 'high';
  else if (casualtyRisk > 15) severity = 'medium';
  
  return {
    casualtyRiskPercent: Math.round(casualtyRisk),
    rescueWindowMinutes: Math.round(rescueWindow),
    collapseTimeSeconds: collapseTime,
    occupancyAtRisk: Math.round(totalOccupancy * (casualtyRisk / 100)),
    severity
  };
}

// ============================================
// 5. VIRTUAL SENSOR SYSTEM
// ============================================
export interface SensorReading {
  id: string;
  type: 'strain' | 'acceleration' | 'crack' | 'displacement';
  floor: number;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: number;
}

export function generateSensorReadings(
  displacements: number[],
  accelerations: number[],
  time: number
): SensorReading[] {
  const sensors: SensorReading[] = [];
  
  displacements.forEach((d, i) => {
    const acc = accelerations[i] || 0;
    const strain = Math.abs(d) * 1000; // micro-strain
    const crackWidth = Math.max(0, (Math.abs(d) - 0.01) * 50); // mm
    
    // Strain sensor
    sensors.push({
      id: `STR-F${i + 1}`,
      type: 'strain',
      floor: i + 1,
      value: Math.round(strain * 100) / 100,
      unit: 'με',
      status: strain > 2000 ? 'critical' : strain > 1000 ? 'warning' : 'normal',
      timestamp: time
    });
    
    // Acceleration sensor
    sensors.push({
      id: `ACC-F${i + 1}`,
      type: 'acceleration',
      floor: i + 1,
      value: Math.round(Math.abs(acc) * 100) / 100,
      unit: 'm/s²',
      status: Math.abs(acc) > 5 ? 'critical' : Math.abs(acc) > 2 ? 'warning' : 'normal',
      timestamp: time
    });
    
    // Crack sensor
    sensors.push({
      id: `CRK-F${i + 1}`,
      type: 'crack',
      floor: i + 1,
      value: Math.round(crackWidth * 100) / 100,
      unit: 'mm',
      status: crackWidth > 3 ? 'critical' : crackWidth > 1 ? 'warning' : 'normal',
      timestamp: time
    });
  });
  
  return sensors;
}

// ============================================
// 6. CITY CASCADE MODEL
// ============================================
export interface BuildingInCity {
  id: string;
  name: string;
  x: number;
  y: number;
  floors: number;
  status: 'intact' | 'damaged' | 'collapsed';
  damagePercent: number;
}

export function simulateCityCascade(
  buildings: BuildingInCity[],
  collapsingBuildingId: string
): BuildingInCity[] {
  const collapsing = buildings.find(b => b.id === collapsingBuildingId);
  if (!collapsing) return buildings;
  
  return buildings.map(b => {
    if (b.id === collapsingBuildingId) {
      return { ...b, status: 'collapsed' as const, damagePercent: 100 };
    }
    
    // Calculate distance
    const dist = Math.sqrt(
      Math.pow(b.x - collapsing.x, 2) + Math.pow(b.y - collapsing.y, 2)
    );
    
    // Impact radius based on collapsed building height
    const impactRadius = collapsing.floors * 3; // meters
    
    if (dist < impactRadius) {
      const impactFactor = 1 - (dist / impactRadius);
      const additionalDamage = impactFactor * 50;
      const newDamage = Math.min(100, b.damagePercent + additionalDamage);
      
      return {
        ...b,
        damagePercent: newDamage,
        status: newDamage > 80 ? 'collapsed' as const : newDamage > 30 ? 'damaged' as const : b.status
      };
    }
    
    return b;
  });
}

// ============================================
// 7. AGING MODEL
// ============================================
export interface AgingFactors {
  strengthReduction: number;      // 0-1 (1 = full strength)
  stiffnessReduction: number;     // 0-1
  dampingIncrease: number;        // 1+ (higher = more damping)
  corrosionLevel: 'none' | 'mild' | 'moderate' | 'severe';
  description: string;
}

export function calculateAgingFactors(ageYears: number): AgingFactors {
  // Rule 1: Age ↑ ⇒ Strength ↓, Stiffness ↓
  const normalizedAge = Math.min(ageYears / 100, 1);
  
  // Degradation curves (Non-linear for realism)
  const strengthReduction = Math.max(0.4, 1 - (normalizedAge * 0.5)); // Up to 60% loss
  const stiffnessReduction = Math.max(0.4, 1 - (normalizedAge * 0.45)); // Up to 55% loss
  const dampingIncrease = 1 + (normalizedAge * 0.8); // Higher damping as joints loosen
  
  let corrosionLevel: 'none' | 'mild' | 'moderate' | 'severe' = 'none';
  let description = '';
  
  if (ageYears < 15) {
    corrosionLevel = 'none';
    description = 'Modern structure. Nominal performance.';
  } else if (ageYears < 40) {
    corrosionLevel = 'mild';
    description = 'Mature structure. Secondary components aging.';
  } else if (ageYears < 70) {
    corrosionLevel = 'moderate';
    description = 'Significant aging. Critical strength reduction.';
  } else {
    corrosionLevel = 'severe';
    description = 'Heritage structure. Extreme fragility. Retrofit essential.';
  }
  
  return {
    strengthReduction,
    stiffnessReduction,
    dampingIncrease,
    corrosionLevel,
    description
  };
}

// ============================================
// 8. DECISION INTELLIGENCE ENGINE
// ============================================
export interface DecisionRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  reasoning: string;
  timeframe: string;
  icon: 'shield' | 'alert' | 'evacuate' | 'repair' | 'inspect';
}

export function generateRecommendations(
  maxDrift: number,
  safetyScore: number,
  structuralMemory: StructuralMemory,
  agingFactors: AgingFactors
): DecisionRecommendation[] {
  const recommendations: DecisionRecommendation[] = [];
  
  // Immediate evacuation check
  if (maxDrift > 3.0 || safetyScore < 30) {
    recommendations.push({
      priority: 'critical',
      action: 'EVACUATE IMMEDIATELY',
      reasoning: 'Structural integrity compromised. Collapse risk is high.',
      timeframe: 'NOW',
      icon: 'evacuate'
    });
  }
  
  // Aftershock warning
  if (maxDrift > 2.0 && structuralMemory.fatigueMultiplier > 1.2) {
    recommendations.push({
      priority: 'high',
      action: 'AFTERSHOCK WARNING',
      reasoning: 'Structure has accumulated damage. Cannot withstand another significant event.',
      timeframe: 'Next 24 hours',
      icon: 'alert'
    });
  }
  
  // Retrofit recommendation
  if (agingFactors.corrosionLevel === 'severe' || structuralMemory.totalDamageHistory > 40) {
    recommendations.push({
      priority: 'high',
      action: 'RETROFITTING REQUIRED',
      reasoning: 'Structural capacity has degraded. Seismic strengthening is necessary.',
      timeframe: 'Within 6 months',
      icon: 'repair'
    });
  }
  
  // Safe for aftershock
  if (maxDrift < 1.5 && safetyScore > 70) {
    recommendations.push({
      priority: 'low',
      action: 'SAFE FOR MINOR AFTERSHOCKS',
      reasoning: 'Structure is within acceptable damage limits. Monitor for changes.',
      timeframe: 'Continuous monitoring',
      icon: 'shield'
    });
  }
  
  // Inspection needed
  if (maxDrift > 1.0 && maxDrift < 2.5) {
    recommendations.push({
      priority: 'medium',
      action: 'STRUCTURAL INSPECTION REQUIRED',
      reasoning: 'Moderate damage detected. Professional assessment needed before reoccupancy.',
      timeframe: 'Within 48 hours',
      icon: 'inspect'
    });
  }
  
  return recommendations;
}

// ============================================
// 9. AFTERSHOCK GENERATOR
// ============================================
export interface AftershockEvent {
  time: number;        // seconds after main shock
  magnitude: number;
  duration: number;
}

export function generateAftershockSequence(
  mainMagnitude: number,
  hoursToSimulate: number = 24
): AftershockEvent[] {
  const aftershocks: AftershockEvent[] = [];
  
  // Modified Omori's law for aftershock frequency
  const k = Math.pow(10, mainMagnitude - 5);
  const p = 1.1;
  
  let currentTime = 60; // Start 1 minute after main shock
  const endTime = hoursToSimulate * 3600;
  
  while (currentTime < endTime && aftershocks.length < 20) {
    // Time interval follows Omori's law
    const rate = k / Math.pow(currentTime / 3600, p);
    const interval = Math.max(300, 3600 / rate); // At least 5 min between aftershocks
    
    // Magnitude follows Bath's law (about 1.2 less than main shock)
    const maxAftershockMag = mainMagnitude - 1.2 - Math.random() * 0.5;
    const mag = Math.max(4.0, maxAftershockMag - Math.random() * 2);
    
    aftershocks.push({
      time: currentTime,
      magnitude: Math.round(mag * 10) / 10,
      duration: 5 + Math.random() * 10
    });
    
    currentTime += interval * (0.5 + Math.random());
  }
  
  return aftershocks;
}

// ============================================
// 10. MULTI-DISASTER MODE
// ============================================
export interface DisasterState {
  earthquake: { active: boolean; magnitude: number };
  fire: { 
    active: boolean; 
    floors: number[]; 
    spreadRate: number;
    intensity: number; // 0-100
  };
  gasLeak: { 
    active: boolean; 
    floor: number; 
    concentration: number; // ppm
    explosionRisk: number; // 0-100
  };
  compoundRisk: number; // 0-100
}

export function updateDisasterState(
  current: DisasterState,
  deltaTime: number,
  structuralDamage: number
): DisasterState {
  let newState = { ...current };
  
  // Fire spread based on time and structural damage
  if (current.fire.active) {
    const spreadChance = (current.fire.intensity / 100) * (structuralDamage / 50) * deltaTime;
    if (Math.random() < spreadChance && current.fire.floors.length < 5) {
      const lastFloor = current.fire.floors[current.fire.floors.length - 1];
      newState.fire.floors = [...current.fire.floors, lastFloor + 1];
    }
    newState.fire.intensity = Math.min(100, current.fire.intensity + deltaTime * 2);
  }
  
  // Gas leak concentration increase
  if (current.gasLeak.active) {
    newState.gasLeak.concentration = Math.min(10000, current.gasLeak.concentration + deltaTime * 50);
    // Explosion risk based on concentration and fire proximity
    const fireNear = current.fire.floors.includes(current.gasLeak.floor);
    newState.gasLeak.explosionRisk = fireNear ? 
      Math.min(100, current.gasLeak.concentration / 50) : 
      Math.min(50, current.gasLeak.concentration / 100);
  }
  
  // Compound risk calculation
  let risk = 0;
  if (newState.earthquake.active) risk += 40 * (newState.earthquake.magnitude / 9);
  if (newState.fire.active) risk += 30 * (newState.fire.intensity / 100);
  if (newState.gasLeak.active) risk += 30 * (newState.gasLeak.explosionRisk / 100);
  
  newState.compoundRisk = Math.min(100, risk);
  
  return newState;
}

export function createInitialDisasterState(): DisasterState {
  return {
    earthquake: { active: false, magnitude: 0 },
    fire: { active: false, floors: [], spreadRate: 0, intensity: 0 },
    gasLeak: { active: false, floor: 0, concentration: 0, explosionRisk: 0 },
    compoundRisk: 0
  };
}

// Utility
function calculateVariance(arr: number[]): number {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length / (mean * mean);
}
