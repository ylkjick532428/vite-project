import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    // Save original viewport
    const originalViewport = document.querySelector("meta[name=viewport]")?.getAttribute("content");

    // Update viewport to prevent resizing
    const viewportMeta = document.querySelector("meta[name=viewport]");
    if (viewportMeta) {
      viewportMeta.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height",
      );
    }

    // Add class to prevent scrolling on body
    document.body.classList.add("keyboard-open");

    return () => {
      // Restore original viewport
      if (viewportMeta && originalViewport) {
        viewportMeta.setAttribute("content", originalViewport);
      }
      document.body.classList.remove("keyboard-open");
    };
  }, []);

  return <div></div>;
};

export default App;
