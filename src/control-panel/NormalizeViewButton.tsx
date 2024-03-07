import { useSetAtom } from "jotai";
import { normalizeViewAtom } from "../atoms/atoms";

export function NormalizeViewButton() {
  const normalizeView = useSetAtom(normalizeViewAtom);

  return (
    <button
      type="button"
      onClick={() => {
        normalizeView();
      }}
    >
      Fit curve in view
    </button>
  );
}
