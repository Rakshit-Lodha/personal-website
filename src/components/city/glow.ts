"use client";

import { createContext, useContext } from "react";

/** 0 = midday, 1 = dusk. Mutated every frame by CityScene, read by materials. */
export const GlowContext = createContext<{ current: number }>({ current: 0 });

export function useGlow() {
  return useContext(GlowContext);
}
