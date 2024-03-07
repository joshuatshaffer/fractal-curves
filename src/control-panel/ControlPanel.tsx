import { AnimationControl } from "./AnimationControl";
import styles from "./ControlPanel.module.scss";
import { Examples } from "./Examples";
import { GeneratorEditor } from "./GeneratorEditor";
import { IterationsControl } from "./IterationsControl";
import { NormalizeViewButton } from "./NormalizeViewButton";
import { RenderModeControl } from "./RenderModeControl";

export function ControlPanel() {
  return (
    <div className={styles.settingsContainer}>
      <details>
        <summary>Settings</summary>
        <div>
          <NormalizeViewButton />
          <IterationsControl />
          <RenderModeControl />
          <AnimationControl />
        </div>
      </details>
      <details>
        <summary>Generator</summary>
        <GeneratorEditor />
      </details>
      <details>
        <summary>Examples</summary>
        <Examples />
      </details>
    </div>
  );
}
