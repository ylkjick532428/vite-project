import VConsole from "vconsole";
import { v7 as uuidv7 } from "uuid";
import { useState, useCallback, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import axios from "axios";
import DebugSettingDraggable from "./debug/DebugSettingDraggable";
import App from "./App";
import "./index.css";

const urlArgs: any = Object.fromEntries(new URLSearchParams(location.search));

// Replace the RESOLUTIONS constant with this
const STATIC_RESOLUTIONS = {
  "360p": { width: 640, height: 360 },
  "720p": { width: 1280, height: 720 },
  "1080p": { width: 1920, height: 1080 },
  "1440p": { width: 2560, height: 1440 },
} as const;

const POSITIONS = {
  "top-left": { top: 0, left: 0 },
  "top-right": { top: 0, right: 0 },
  "bottom-left": { bottom: 0, left: 0 },
  "bottom-right": { bottom: 0, right: 0 },
};

export default function HomeApp() {
  const [showJoinFlow, setShowJoinFlow] = useState(true);
  const [containerStyle, setContainerStyle] = useState({
    width: "100%",
    height: "100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    display: "none",
  });
  const [showControls, setShowControls] = useState(false);
  const isDraggable = urlArgs.drag === "1";
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef<number>();
  const controlPanelRef = useRef<HTMLDivElement>(null);

  const defaultStyle = useRef({
    width: "100%",
    height: "100%",
    position: "absolute" as const,
    top: 0,
    left: 0,
    display: "block",
  });

  // Add these state variables inside HomeApp component
  const [currentResolution, setCurrentResolution] = useState<string>("fullscreen");
  const [currentPosition, setCurrentPosition] = useState<string>("top-left");

  // Inside the HomeApp component, add this state
  const [fullscreenResolution, setFullscreenResolution] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Add this new ref at the top of the HomeApp component with other refs
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  const updateContainerSize = useCallback(
    (resolution: keyof typeof STATIC_RESOLUTIONS | "fullscreen") => {
      const dimensions = resolution === "fullscreen" ? fullscreenResolution : STATIC_RESOLUTIONS[resolution];

      setContainerStyle((prev) => ({
        ...prev,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        display: "block",
      }));

      // Center the container after resizing
      setPosition({
        x: (window.innerWidth - dimensions.width) / 2,
        y: (window.innerHeight - dimensions.height) / 2,
      });

      // Update current resolution
      setCurrentResolution(resolution);
    },
    [fullscreenResolution],
  );

  const updateContainerPosition = useCallback(
    (positionKey: keyof typeof POSITIONS) => {
      const pos = POSITIONS[positionKey];
      setContainerStyle((prev) => ({
        ...prev,
        display: "block",
      }));

      // Calculate position based on the selected corner
      const width = parseInt(containerStyle.width as string);
      const height = parseInt(containerStyle.height as string);

      let x = 0;
      let y = 0;

      if ("right" in pos) {
        x = window.innerWidth - width;
      }
      if ("bottom" in pos) {
        y = window.innerHeight - height;
      }

      setPosition({ x, y });

      // Update current position
      setCurrentPosition(positionKey);
    },
    [containerStyle.width, containerStyle.height],
  );

  const handleDrag = useCallback((_e: any, data: { x: number; y: number }) => {
    setPosition({ x: data.x, y: data.y });
  }, []);

  const resetContainer = useCallback(() => {
    setContainerStyle(defaultStyle.current);
    setPosition({ x: 0, y: 0 });
    setCurrentResolution("fullscreen");
    setCurrentPosition("top-left");
  }, []);

  // Add touch event handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // Prevent default only if touching the control panel
    if (controlPanelRef.current?.contains(e.target as Node)) {
      e.preventDefault();
    }
  }, []);

  // Setup touch events and cleanup
  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: false });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleTouchStart]);

  // Add this function inside the HomeApp component
  const handleFullscreen = useCallback(() => {
    updateContainerSize("fullscreen");
    setPosition({ x: 0, y: 0 }); // Reset position when going fullscreen
  }, [updateContainerSize]);

  // Update the useEffect that handles window resizing
  useEffect(() => {
    const handleResize = () => {
      // Update fullscreen resolution when window is resized
      setFullscreenResolution({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // If currently in fullscreen, update the container size
      if (containerStyle.width === `${window.innerWidth}px`) {
        updateContainerSize("fullscreen");
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [containerStyle.width, updateContainerSize]);

  const nodeRef = useRef(null);

  useEffect(() => {
    setShowControls(true);
  }, []);

  console.log({ isDraggable, showControls });
  return (
    <div className="App" style={{ height: "100vh", width: "100vw" }}>
      <main style={{ height: "100%", width: "100%" }} id="debug-demo-container">
        {showJoinFlow && (
          <div id="join-flow" className="debug-tool-join-flow">
            <h1 className="debug-tool-join-title">Example</h1>
            <p className="debug-tool-join-description">
              User interface offered Vite+React+Taillwind+Eslint9+Typescript
            </p>
          </div>
        )}
        {isDraggable && (
          <Draggable
            position={position}
            onDrag={handleDrag}
            disabled={!isDraggable}
            bounds="body"
            nodeRef={nodeRef}
            handle="#debug-header"
          >
            <div id="sessionContainer" style={containerStyle} ref={nodeRef}>
              <App />
            </div>
          </Draggable>
        )}
        {!isDraggable && (
          <div id="sessionContainer" style={containerStyle} ref={nodeRef}>
            <App />
          </div>
        )}

        <div className="w-10 h-10">
          {showControls && (
            <DebugSettingDraggable
              isDraggable={isDraggable}
              updateContainerSize={updateContainerSize}
              updateContainerPosition={updateContainerPosition}
              resetContainer={resetContainer}
              handleFullscreen={handleFullscreen}
              currentResolution={currentResolution}
              currentPosition={currentPosition}
            />
          )}
        </div>
      </main>
    </div>
  );
}
