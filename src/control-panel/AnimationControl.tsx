import { useAtom } from "jotai";
import { iterationsAnimationAtom } from "../atoms/atoms";

export function AnimationControl() {
  const [iterationsAnimation, setIterationsAnimation] = useAtom(
    iterationsAnimationAtom
  );

  return (
    <div>
      <label htmlFor="animate-checkbox">Animate </label>
      <input
        id="animate-checkbox"
        type="checkbox"
        checked={iterationsAnimation === "running"}
        onChange={(e) => {
          setIterationsAnimation(e.target.checked ? "running" : "stopped");
        }}
      />
    </div>
  );
}
