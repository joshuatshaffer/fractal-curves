import { useAtom } from "jotai";
import { showControlOverlayAtom } from "../atoms/atoms";

export function ShowControlOverlayToggle() {
  const [showControlOverlay, setShowControlOverlay] = useAtom(
    showControlOverlayAtom
  );

  return (
    <label>
      <input
        type="checkbox"
        checked={showControlOverlay}
        onChange={(event) => setShowControlOverlay(event.target.checked)}
      />
      Show controls
    </label>
  );
}
