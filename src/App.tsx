import { useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

import "./App.scss";

function App(): JSX.Element {
  const [count, setCount] = useState(0);

  return (
    <div style={{ height: window.innerHeight, width: window.innerWidth }}>
      <Excalidraw />
    </div>
  );
}

export default App;
