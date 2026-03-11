// LibreSpeed-based, production-style speed test service.
// ---------------------------------------------------------------------------
// This file REPLACES the previous ndt7/Cloudflare-based speed test logic.
// All old mocked or estimated logic has been removed. We now use the
// official LibreSpeed JS client (`Speedtest` from `speedtest.js`) and
// map its real measurements into our existing UI.
//
// Public API is kept compatible with the existing components:
// - `runNetworkSpeedTest()` still resolves to { ping, download, upload }
//   so current UI continues to work without design changes.
// - We also return jitter and testedAt internally.
//
// Metrics:
// - download: Mbps (number, 2 decimals)
// - upload: Mbps (number, 2 decimals)
// - ping: ms (number, 2 decimals)
// - jitter: ms (number, 2 decimals)

// We load the official LibreSpeed JS client at runtime from GitHub via jsDelivr.
// The script globally defines `window.Speedtest`, which we then use.

const LIBRESPEED_SCRIPT_URL =
  "https://cdn.jsdelivr.net/gh/librespeed/speedtest@master/speedtest.js";

// LibreSpeed backend configuration.
// NOTE: This points to the public LibreSpeed backend. For production you
// should host your own LibreSpeed backend and update these URLs accordingly.
const LIBRESPEED_SERVER = {
  name: "LibreSpeed Public",
  server: "https://librespeed.org/backend/",
  dlURL: "garbage.php",
  ulURL: "empty.php",
  pingURL: "empty.php",
  getIpURL: "getIP.php",
};

type SpeedTestPhase = "idle" | "ping" | "download" | "upload" | "completed" | "failed";

export interface NetworkSpeedResult {
  ping: number;
  download: number;
  upload: number;
  jitter: number;
  testedAt: string;
}

export interface RunNetworkSpeedTestOptions {
  // Kept for backward compatibility with the existing UI.
  onStage?: (stage: "ping" | "download" | "upload") => void;
}

declare global {
  interface Window {
    Speedtest?: any;
  }
}

let scriptLoadPromise: Promise<void> | null = null;

function loadLibreSpeedScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("Speed test can only run in a browser environment.")
    );
  }

  if (window.Speedtest) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    console.log("[librespeed] loading client script", LIBRESPEED_SCRIPT_URL);
    const script = document.createElement("script");
    script.src = LIBRESPEED_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      console.log("[librespeed] client script loaded");
      if (!window.Speedtest) {
        reject(new Error("LibreSpeed client did not expose Speedtest constructor."));
      } else {
        resolve();
      }
    };
    script.onerror = () => {
      reject(new Error("Failed to load LibreSpeed client script."));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

function parseNumber(value: unknown): number {
  if (typeof value === "number" && isFinite(value)) return value;
  if (typeof value === "string") {
    const n = parseFloat(value);
    if (!isNaN(n) && isFinite(n)) return n;
  }
  return NaN;
}

function roundMbps(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundMs(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function runNetworkSpeedTest(
  options: RunNetworkSpeedTestOptions = {}
): Promise<NetworkSpeedResult> {
  console.log("[librespeed] speed test started");

  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    console.error("[librespeed] offline detected");
    throw new Error("You appear to be offline. Please check your connection.");
  }

  await loadLibreSpeedScript();

  if (!window.Speedtest) {
    throw new Error("LibreSpeed Speedtest client is not available.");
  }

  const s = new window.Speedtest();

  // Configure test durations and stability.
  // 10 seconds for download and upload, and more ping samples for stable latency.
  s.setParameter("time_dl", 10);
  s.setParameter("time_ul", 10);
  s.setParameter("count_ping", 20);
  // Enable multi-connection testing when supported for more stable results.
  s.setParameter("dl_ul_max_ports", 4);

  // Single-server setup (can be replaced with your own backend later).
  s.addTestPoint(LIBRESPEED_SERVER);

  let phase: SpeedTestPhase = "idle";
  let latestDownload = 0;
  let latestUpload = 0;
  let latestPing = 0;
  let latestJitter = 0;

  const { onStage } = options;

  // Global timeout so the test cannot hang forever.
  const TIMEOUT_MS = 45_000;

  return new Promise<NetworkSpeedResult>((resolve, reject) => {
    let timeoutId: number | undefined;

    const fail = (err: unknown) => {
      phase = "failed";
      console.error("[librespeed] error", err);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      reject(err instanceof Error ? err : new Error(String(err)));
    };

    // Map LibreSpeed testState to our logical phases and to existing UI stages.
    function updatePhaseFromTestState(testState: number) {
      if (testState === 1) {
        phase = "download";
        onStage?.("download");
      } else if (testState === 2) {
        phase = "ping";
        onStage?.("ping");
      } else if (testState === 3) {
        phase = "upload";
        onStage?.("upload");
      }
    }

    s.onupdate = (data: any) => {
      console.log("[librespeed] onupdate raw", data);

      if (!data) return;

      if (typeof data.testState === "number") {
        updatePhaseFromTestState(data.testState);
      }

      const dl = parseNumber(data.dlStatus);
      if (!isNaN(dl) && dl > 0) {
        latestDownload = dl;
        console.log("[librespeed] live download Mbps", latestDownload);
      }

      const ul = parseNumber(data.ulStatus);
      if (!isNaN(ul) && ul > 0) {
        latestUpload = ul;
        console.log("[librespeed] live upload Mbps", latestUpload);
      }

      const ping = parseNumber(data.pingStatus);
      if (!isNaN(ping) && ping >= 0) {
        latestPing = ping;
        console.log("[librespeed] live ping ms", latestPing);
      }

      const jit = parseNumber(data.jitterStatus ?? data.jitStatus);
      if (!isNaN(jit) && jit >= 0) {
        latestJitter = jit;
        console.log("[librespeed] live jitter ms", latestJitter);
      }
    };

    s.onend = (aborted: boolean) => {
      console.log("[librespeed] onend", {
        aborted,
        latestDownload,
        latestUpload,
        latestPing,
        latestJitter,
      });

      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }

      if (aborted) {
        phase = "failed";
        return fail(new Error("Speed test aborted."));
      }

      // If no valid throughput values were observed, treat as a real failure.
      if (!(latestDownload > 0) && !(latestUpload > 0)) {
        phase = "failed";
        return fail(
          new Error("Speed test did not produce any valid download/upload values.")
        );
      }

      phase = "completed";

      const result: NetworkSpeedResult = {
        download: roundMbps(latestDownload),
        upload: roundMbps(latestUpload),
        ping: roundMs(latestPing),
        jitter: roundMs(latestJitter),
        testedAt: new Date().toISOString(),
      };

      console.log("[librespeed] final parsed values", result);
      resolve(result);
    };

    // Select the best server, then start the test.
    try {
      s.selectServer(() => {
        console.log("[librespeed] server selected, starting test");

        // Start timeout after server selection and start.
        timeoutId = window.setTimeout(() => {
          console.error("[librespeed] timeout");
          try {
            s.abort();
          } catch {
            // ignore
          }
          fail(new Error("Speed test timed out. Please try again."));
        }, TIMEOUT_MS);

        try {
          s.start();
        } catch (err) {
          fail(err);
        }
      });
    } catch (err) {
      fail(err);
    }
  });
}

