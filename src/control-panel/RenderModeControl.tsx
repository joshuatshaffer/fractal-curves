import { useAtom } from "jotai";
import { renderModeAtom } from "../atoms/atoms";

export function RenderModeControl() {
  const [renderMode, setRenderMode] = useAtom(renderModeAtom);

  return (
    <fieldset>
      <legend>Render mode</legend>
      {(
        [
          { value: "line", label: "Line" },
          { value: "fill", label: "Fill" },
          { value: "gradient", label: "Gradient" },
        ] as const
      ).map(({ value, label }) => {
        const inputId = `render-mode-${value}`;

        return (
          <span key={value}>
            <input
              id={inputId}
              type="radio"
              value={value}
              checked={renderMode === value}
              onChange={(event) => {
                if (event.target.checked) {
                  setRenderMode(value);
                }
              }}
            />
            <label htmlFor={inputId}>{label}</label>
          </span>
        );
      })}
    </fieldset>
  );
}
