// Browser Performance Testing Suite

interface PerformanceMetrics {
  timing: {
    totalLoadTime?: number;
    domContentLoaded?: number;
    firstPaint?: number | "Not available";
    firstContentfulPaint?: number | "Not available";
  };
  memory: {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  };
  resources: ResourceMetric[];
  layout: {
    cumulativeLayoutShift?: string;
  };
}

interface ResourceMetric {
  name: string;
  type: string;
  duration: number;
  size: number;
}

interface ExtendedPerformance extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

interface PerformanceNavigationTiming extends PerformanceEntry {
  loadEventEnd: number;
  navigationStart: number;
  domContentLoadedEventEnd: number;
}

interface PerformanceResourceTiming extends PerformanceEntry {
  initiatorType: string;
  transferSize: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  value: number;
}

class BrowserPerformanceTest {
  private metrics: PerformanceMetrics;

  constructor() {
    this.metrics = {
      timing: {},
      memory: {},
      resources: [],
      layout: {},
    };
  }

  async measurePageLoad(): Promise<void> {
    const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    if (navEntry) {
      this.metrics.timing = {
        totalLoadTime: navEntry.loadEventEnd - navEntry.navigationStart,
        domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.navigationStart,
        firstPaint: performance.getEntriesByType("paint")[0]?.startTime || "Not available",
        firstContentfulPaint: performance.getEntriesByType("paint")[1]?.startTime || "Not available",
      };
    }
  }

  measureMemory(): void {
    const extendedPerformance = performance as ExtendedPerformance;
    if (extendedPerformance.memory) {
      this.metrics.memory = {
        usedJSHeapSize: Math.round(extendedPerformance.memory.usedJSHeapSize / (1024 * 1024)),
        totalJSHeapSize: Math.round(extendedPerformance.memory.totalJSHeapSize / (1024 * 1024)),
        jsHeapSizeLimit: Math.round(extendedPerformance.memory.jsHeapSizeLimit / (1024 * 1024)),
      };
    }
  }

  measureResources(): void {
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    this.metrics.resources = resources.map((resource) => ({
      name: resource.name.split("/").pop() || "",
      type: resource.initiatorType,
      duration: Math.round(resource.duration),
      size: resource.transferSize,
    }));
  }

  measureLayoutMetrics(): void {
    const layoutShifts = performance.getEntriesByType("layout-shift") as LayoutShiftEntry[];
    this.metrics.layout = {
      cumulativeLayoutShift: layoutShifts.reduce((sum, shift) => sum + shift.value, 0).toFixed(3),
    };
  }

  async runFullTest(): Promise<string> {
    await this.measurePageLoad();
    this.measureMemory();
    this.measureResources();
    this.measureLayoutMetrics();
    return this.generateReport();
  }

  generateReport(): string {
    return `
    🔍 Browser Performance Report
    ===========================

    📊 Page Load Metrics
    ------------------
    Total Load Time: ${this.metrics.timing.totalLoadTime}ms
    DOM Content Loaded: ${this.metrics.timing.domContentLoaded}ms
    First Paint: ${this.metrics.timing.firstPaint}ms
    First Contentful Paint: ${this.metrics.timing.firstContentfulPaint}ms

    💾 Memory Usage
    -------------
    Used JS Heap: ${this.metrics.memory.usedJSHeapSize}MB
    Total JS Heap: ${this.metrics.memory.totalJSHeapSize}MB
    JS Heap Limit: ${this.metrics.memory.jsHeapSizeLimit}MB

    📦 Resource Loading
    -----------------
    ${this.metrics.resources
      .map((res) => `${res.name} (${res.type}): ${res.duration}ms, ${(res.size / 1024).toFixed(1)}KB`)
      .join("\n    ")}

    📐 Layout Metrics
    ---------------
    Cumulative Layout Shift: ${this.metrics.layout.cumulativeLayoutShift}
    `;
  }
}

export default BrowserPerformanceTest;
