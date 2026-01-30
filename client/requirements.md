## Packages
three | For 3D visualization
@react-three/fiber | React renderer for Three.js
@react-three/drei | Helpers for React Three Fiber
mathjs | For matrix calculations in physics engine
recharts | For real-time graphing of displacement/drift

## Notes
The physics engine needs to run on the client side for real-time interactivity.
We will use a custom hook `useStructuralDynamics` to handle the Newmark-Beta integration.
The 3D visualization will consume the state from the physics engine frame-by-frame.
