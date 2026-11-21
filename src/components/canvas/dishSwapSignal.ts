/**
 * Shared signal between BrassCloche and SignatureDishes.
 *
 * BrassCloche writes `readyToSwap = true` at the exact moment the cloche is
 * fully closed (Phase C, t = 0.85 s). SignatureDishes polls this in useFrame,
 * flips the displayed dish to `pendingCourse`, then resets the flag.
 *
 * Using a plain mutable object avoids Zustand re-renders and keeps all
 * mutation inside useFrame / useEffect where it belongs.
 */
export const dishSwapSignal = {
  readyToSwap:   false,
  pendingCourse: -1,   // -1 = nothing pending
};
