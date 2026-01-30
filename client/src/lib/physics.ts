import * as math from 'mathjs';

// Physics constants
export const DT = 0.02; // Time step (50Hz)
export const G = 9.81;

// Types
export interface SimulationState {
  time: number;
  displacements: number[];
  velocities: number[];
  accelerations: number[];
  groundAccel: number;
  maxDrift: number;
  damageLevels: ('safe' | 'moderate' | 'critical')[];
}

// Generate earthquake ground motion
export function generateEarthquake(magnitude: number, duration: number, soilType: string, timeSteps: number): number[] {
  // Simplified synthetic ground motion generation
  // Uses amplitude scaling based on magnitude and frequency content based on soil
  const acc: number[] = [];
  const pga = 0.1 * Math.pow(10, 0.5 * (magnitude - 5)) * G; // Approximate PGA scaling
  
  let dominantFreq = 2 * Math.PI; // Default 1Hz
  if (soilType === 'rock') dominantFreq = 10; // Stiff soil/rock -> High freq
  if (soilType === 'soft') dominantFreq = 2;  // Soft soil -> Low freq

  // Envelope function for earthquake shape (Trapezoidal-ish)
  const t1 = duration * 0.2;
  const t2 = duration * 0.8;

  for (let i = 0; i < timeSteps; i++) {
    const t = i * DT;
    let envelope = 0;
    
    if (t < t1) envelope = (t / t1) * (t / t1); // Quadratic rise
    else if (t < t2) envelope = 1.0;
    else if (t < duration) envelope = Math.exp(-2 * (t - t2));
    else envelope = 0;

    // Random phase noise mixed with dominant frequency
    const noise = (Math.random() - 0.5) * 0.5;
    const signal = Math.sin(dominantFreq * t) + Math.sin(dominantFreq * 1.5 * t) * 0.5 + noise;
    
    acc.push(signal * envelope * pga);
  }
  return acc;
}

// Newmark-Beta Integration Step
export function solveStep(
  masses: number[],
  stiffnesses: number[],
  dampings: number[],
  prevDisp: number[],
  prevVel: number[],
  prevAcc: number[],
  groundAccel: number
): { disp: number[], vel: number[], acc: number[] } {
  const n = masses.length;
  // Beta and Gamma for Newmark (Average Acceleration method)
  const beta = 0.25;
  const gamma = 0.5;

  // We solve MDOF system. simplified to a shear building model for performance
  // This is a 1D simplification where each floor has 1 DOF (horizontal X)
  
  const disp = new Array(n).fill(0);
  const vel = new Array(n).fill(0);
  const acc = new Array(n).fill(0);

  // This is a simplified iterative solver or direct solver for tridiagonal system
  // For standard shear building, K is tridiagonal.
  
  // Effective Stiffness K_hat = K + a0*M + a1*C
  // Effective Force R_hat = -M*ag + M(...) + C(...)
  
  // To keep this strictly client-side efficient without heavy matrix lib overhead every frame:
  // We use explicit central difference if DT is small enough, or simplified implementation.
  // Here we'll implement a simplified explicit loop which is stable for small DT in this context.
  
  // Calculate internal forces
  for (let i = 0; i < n; i++) {
    const m = masses[i];
    const k = stiffnesses[i]; // stiffness of floor i (relative to i-1)
    const c = dampings[i];
    
    // Relative displacement/vel across the story
    const d_rel = i === 0 ? prevDisp[i] : prevDisp[i] - prevDisp[i-1];
    const v_rel = i === 0 ? prevVel[i] : prevVel[i] - prevVel[i-1];
    
    // Story shear force from current floor
    const fs = k * d_rel + c * v_rel;
    
    // Force from floor above (if exists)
    let fs_above = 0;
    if (i < n - 1) {
      const k_above = stiffnesses[i+1];
      const c_above = dampings[i+1];
      const d_rel_above = prevDisp[i+1] - prevDisp[i];
      const v_rel_above = prevVel[i+1] - prevVel[i];
      fs_above = k_above * d_rel_above + c_above * v_rel_above;
    }

    // Equation of motion for floor i: m * a + fs - fs_above = -m * ag
    // a = (-m*ag - fs + fs_above) / m
    const force_inertial = -m * groundAccel;
    const accel_t = (force_inertial - fs + fs_above) / m;
    
    acc[i] = accel_t;
    vel[i] = prevVel[i] + accel_t * DT;
    disp[i] = prevDisp[i] + vel[i] * DT;
  }

  return { disp, vel, acc };
}

export function calculateDrift(displacements: number[], heightPerFloor: number = 3.5): number[] {
  return displacements.map((d, i) => {
    const prevD = i === 0 ? 0 : displacements[i-1];
    const drift = Math.abs(d - prevD);
    return (drift / heightPerFloor) * 100; // Percentage
  });
}
