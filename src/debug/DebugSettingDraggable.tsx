import { useCallback, useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";
import "./DebugSettingDraggable.css";
import MoveIcon from "./move-icon.svg";
import BrowserPerformanceTest from "./BrowserPerformanceTest";
import { PerformanceCharts } from "./PerformanceCharts";

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

interface DebugSettingDraggableProps {
  isDraggable: boolean;
  updateContainerSize: (resolution: keyof typeof STATIC_RESOLUTIONS | "fullscreen") => void;
  updateContainerPosition: (position: keyof typeof POSITIONS) => void;
  resetContainer: () => void;
  handleFullscreen: () => void;
  currentResolution: string;
  currentPosition: string;
}

const addDragParameter = (url: string, isDraggable: boolean): string => {
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  if (params.has("drag")) {
    params.set("drag", isDraggable ? "1" : "0");
  } else {
    params.append("drag", isDraggable ? "1" : "0");
  }

  urlObj.search = params.toString();
  return urlObj.toString();
};

const addUrlParameters = (argName: string, argValue: string): string => {
  const urlObj = new URL(window.location.href);
  const params = new URLSearchParams(urlObj.search);

  if (!params.has(argName)) {
    params.append(argName, argValue);
  } else {
    params.set(argName, argValue);
  }
  if (argName === "nav") {
    params.set("nav", "1");
  }
  urlObj.search = params.toString();
  return urlObj.toString();
};

const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

export default function DebugSettingDraggable({
  isDraggable,
  updateContainerSize,
  updateContainerPosition,
  resetContainer,
  handleFullscreen,
  currentResolution,
  currentPosition,
}: DebugSettingDraggableProps) {
  const [isControlsVisible, setIsControlsVisible] = useState(false);
  const hideTimeoutRef = useRef<number>();
  const controlPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const settingNodeRef = useRef(null);
  const [settingPosition, setSettingPosition] = useState({ x: 30, y: 50 });
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);
  const [showCharts, setShowCharts] = useState(false);

  const handleSettingDrag = useCallback((_e: any, data: { x: number; y: number }) => {
    setSettingPosition({ x: data.x, y: data.y });
  }, []);

  const showControlsFunction = useCallback(() => {
    setIsControlsVisible(true);
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      controlPanelRef.current &&
      !controlPanelRef.current.contains(event.target as Node) &&
      toggleButtonRef.current &&
      !toggleButtonRef.current.contains(event.target as Node)
    ) {
      setIsControlsVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [handleClickOutside]);

  const toggleDraggable = () => {
    window.location.href = addDragParameter(window.location.href, !isDraggable);
  };

  const handlePerformanceTest = async () => {
    const performanceTest = new BrowserPerformanceTest();
    await performanceTest.runFullTest();
    setPerformanceMetrics(performanceTest.metrics);
    setShowCharts(true);
  };

  return (
    <>
      <Draggable
        position={settingPosition}
        onDrag={handleSettingDrag}
        bounds="body"
        handle=".debug-tool-controls-icon-drag"
        nodeRef={settingNodeRef}
      >
        <div className="flex items-center" ref={settingNodeRef}>
          <div className="bg-white/80 backdrop-blur-md rounded-lg shadow-lg flex items-center p-1.5 gap-2 border border-gray-200/50">
            <button className="text-gray-600 hover:text-gray-800 p-1.5 rounded-md hover:bg-gray-100/50 transition-colors debug-tool-controls-icon-drag cursor-move">
              <svg className="w-4 h-4">
                <MoveIcon />
              </svg>
            </button>
            <button
              ref={toggleButtonRef}
              className="text-gray-600 hover:text-gray-800 p-1.5 rounded-md hover:bg-gray-100/50 transition-colors"
              onClick={showControlsFunction}
              style={{
                display: isControlsVisible ? "none" : "block",
              }}
            >
              <span className="text-lg">⚙️</span>
            </button>
            <button
              onClick={handlePerformanceTest}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
            >
              <span className="text-sm">📊</span>
            </button>
          </div>
        </div>
      </Draggable>

      <div
        ref={controlPanelRef}
        className={`debug-tool-control-panel ${isControlsVisible ? "debug-tool-expanded" : ""}`}
      >
        <div className="debug-tool-control-section">
          <h3>Controls</h3>
          {!isDraggable && <button onClick={() => toggleDraggable()}>Enable Draggable(Refresh)</button>}
          {isDraggable && <button onClick={() => toggleDraggable()}>Disable Draggable(Refresh)</button>}
          <button onClick={resetContainer}>Reset Position / Size</button>
        </div>
        <div className="debug-tool-control-section">
          <h3>Resize</h3>
          {[...Object.keys(STATIC_RESOLUTIONS), "fullscreen"].map((resolution) => (
            <button
              key={resolution}
              onClick={() => {
                if (resolution === "fullscreen") {
                  handleFullscreen();
                } else {
                  updateContainerSize(resolution as keyof typeof STATIC_RESOLUTIONS);
                  setTimeout(() => {
                    window.dispatchEvent(new Event("resize"));
                  }, 1000);
                }
              }}
              className={currentResolution === resolution ? "debug-tool-active" : ""}
            >
              {resolution}
            </button>
          ))}
        </div>
        {isDraggable && (
          <div className="debug-tool-control-section">
            <h3>Position</h3>
            {Object.keys(POSITIONS).map((position) => (
              <button
                key={position}
                onClick={() => updateContainerPosition(position as keyof typeof POSITIONS)}
                className={currentPosition === position ? "debug-tool-active" : ""}
              >
                {position}
              </button>
            ))}
          </div>
        )}

        <div className="debug-tool-control-section">
          {isLocalhost && (
            <>
              <h3>Local Test Tool</h3>
              <button
                onClick={() => {
                  window.location.href = addUrlParameters("nav", "1");
                }}
              >
                Nav
              </button>
              <button
                onClick={() => {
                  window.location.href = addUrlParameters("env", "prod");
                }}
              >
                prod
              </button>
              <button
                onClick={() => {
                  window.location.href = addUrlParameters("env", "go");
                }}
              >
                go
              </button>

              <button
                onClick={() => {
                  window.location.href = addUrlParameters("env", "dev");
                }}
              >
                dev
              </button>
              <button
                onClick={() => {
                  window.location.href = addUrlParameters("debug", "1");
                }}
              >
                debug
              </button>
            </>
          )}
        </div>

        <div className="debug-tool-control-section">
          <h3>API</h3>
          <button onClick={() => {}} className="disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            Leave
          </button>
        </div>
      </div>

      {showCharts && performanceMetrics && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCharts(false);
          }}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto w-[90vw] max-w-[1200px] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCharts(false)}
              className="performance-modal-close"
              aria-label="Close performance charts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <PerformanceCharts metrics={performanceMetrics} />
          </div>
        </div>
      )}
    </>
  );
}
