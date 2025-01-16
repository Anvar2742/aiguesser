import { createContext } from "react";
import type { OrbitControls as ThreeOrbitControls } from 'three-stdlib';

export const Context = createContext<ThreeOrbitControls | null>(null);