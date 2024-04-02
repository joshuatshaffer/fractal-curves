import { ControlPanel } from "./control-panel/ControlPanel";
import { Footer } from "./Footer";
import { FractalView } from "./FractalView";

export function App() {
  return (
    <>
      <FractalView />
      <Footer />
      <ControlPanel />
    </>
  );
}
