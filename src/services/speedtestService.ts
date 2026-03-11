// NDT7-based, production-style speed test service.
// ---------------------------------------------------------------------------
// This file replaces the previous LibreSpeed integration, which could not be
// used from your Vercel deployment due to CORS restrictions on the public
// LibreSpeed backend. We now rely solely on the official M-Lab ndt7
// JavaScript client (`@m-lab/ndt7`), which exposes CORS-friendly endpoints.
//
// Public API (used by your UI):
// - `runNetworkSpeedTest()` resolves to:
//   { ping, download, upload, jitter, testedAt }
//   - download/upload in Mbps (2 decimals)
//   - ping/jitter in ms (2 decimals)

import ndt7 from "@m-lab/ndt7";

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

// Helper to extract Mbps from an ndt7 measurement object.
// Common shapes:
// - SERVER: { AppInfo: { ElapsedTime, NumBytes, MeanClientMbps? }, TCPInfo?, ... }
// - CLIENT: { ElapsedTime, NumBytes, MeanClientMbps } (from worker ClientData)
function extractMbpsFromMeasurement(measurement: any): number {
  if (!measurement) return 0;

  if (
    typeof measurement.MeanClientMbps === "number" &&
    isFinite(measurement.MeanClientMbps) &&
    measurement.MeanClientMbps > 0
  ) {
    return measurement.MeanClientMbps;
  }

  const appInfo = measurement.AppInfo;
  if (appInfo) {
    if (
      typeof appInfo.MeanClientMbps === "number" &&
      isFinite(appInfo.MeanClientMbps) &&
      appInfo.MeanClientMbps > 0
    ) {
      return appInfo.MeanClientMbps;
    }

    const elapsed = appInfo.ElapsedTime; // seconds
    const bytes = appInfo.NumBytes; // bytes
    if (elapsed && bytes) {
      const bits = bytes * 8;
      const mbps = bits / elapsed / 1e6;
      if (mbps > 0) return mbps;
    }
  }

  const elapsed = measurement.ElapsedTime;
  const bytes = measurement.NumBytes;
  if (elapsed && bytes) {
    const bits = bytes * 8;
    const mbps = bits / elapsed / 1e6;
    if (mbps > 0) return mbps;
  }

  return 0;
}

// Helper to extract latency from ndt7 TCPInfo if available.
// MinRTT is in microseconds according to the ndt7 spec.
function extractLatencyMsFromServerMeasurement(measurement: any): number | null {
  if (!measurement || !measurement.TCPInfo) return null;
  const { MinRTT } = measurement.TCPInfo;
  if (typeof MinRTT !== "number" || !isFinite(MinRTT)) return null;
  return MinRTT / 1000; // microseconds -> milliseconds
}

function roundTo2Decimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export async function runNetworkSpeedTest(
  options: RunNetworkSpeedTestOptions = {}
): Promise<NetworkSpeedResult> {
  console.log("[speedtest][ndt7] test started");

  if (typeof window === "undefined") {
    throw new Error("Network speed test can only run in a browser context.");
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You appear to be offline. Please check your connection.");
  }

  const { onStage } = options;
  onStage?.("ping"); // initial phase

  let downloadMbps = 0;
  let uploadMbps = 0;
  let latencyMs = 0;
  const latencySamples: number[] = [];

  const runTestPromise = new Promise<void>((resolve, reject) => {
    const config = {
      mlabDataPolicyInapplicable: true,
      protocol: "wss",
      metadata: {
        client_name: "network-issue-reporting-app",
        client_version: "1.0.0",
      },
    };

    const callbacks = {
      error: (errMsg: string) => {
        console.error("[speedtest][ndt7] error callback", errMsg);
      },
      serverDiscovery: (info: unknown) => {
        console.log("[speedtest][ndt7] discovering server", info);
      },
      serverChosen: (server: unknown) => {
        console.log("[speedtest][ndt7] server chosen", server);
      },
      downloadStart: (data: unknown) => {
        console.log("[speedtest][ndt7] download start", data);
        onStage?.("download");
      },
      downloadMeasurement: ({ Source, Data }: { Source: string; Data: any }) => {
        console.log("[speedtest][ndt7] download measurement raw", {
          Source,
          Data,
        });
        if (!Data) return;

        const mbps = extractMbpsFromMeasurement(Data);
        if (mbps > 0) {
          downloadMbps = mbps;
        }

        if (Source === "server") {
          const latencyCandidate = extractLatencyMsFromServerMeasurement(Data);
          if (latencyCandidate != null && latencyCandidate > 0) {
            latencyMs = latencyCandidate;
            latencySamples.push(latencyCandidate);
          }
        }
      },
      downloadComplete: ({ LastServerMeasurement }: { LastServerMeasurement: any }) => {
        console.log("[speedtest][ndt7] download complete raw", {
          LastServerMeasurement,
        });
        if (LastServerMeasurement) {
          const mbps = extractMbpsFromMeasurement(LastServerMeasurement);
          if (mbps > 0) {
            downloadMbps = mbps;
          }
          const latencyCandidate = extractLatencyMsFromServerMeasurement(
            LastServerMeasurement
          );
          if (latencyCandidate != null && latencyCandidate > 0) {
            latencyMs = latencyCandidate;
            latencySamples.push(latencyCandidate);
          }
        }
      },
      uploadStart: (data: unknown) => {
        console.log("[speedtest][ndt7] upload start", data);
        onStage?.("upload");
      },
      uploadMeasurement: ({ Source, Data }: { Source: string; Data: any }) => {
        console.log("[speedtest][ndt7] upload measurement raw", {
          Source,
          Data,
        });
        if (!Data) return;

        const mbps = extractMbpsFromMeasurement(Data);
        if (mbps > 0) {
          uploadMbps = mbps;
        }
      },
      uploadComplete: ({ LastServerMeasurement }: { LastServerMeasurement: any }) => {
        console.log("[speedtest][ndt7] upload complete raw", {
          LastServerMeasurement,
        });
        if (LastServerMeasurement) {
          const mbps = extractMbpsFromMeasurement(LastServerMeasurement);
          if (mbps > 0) {
            uploadMbps = mbps;
          }
        }
        resolve();
      },
    };

    ndt7
      .test(config as any, callbacks as any)
      .then((code: number) => {
        console.log("[speedtest][ndt7] test finished with code", code, {
          downloadMbps,
          uploadMbps,
          latencyMs,
          latencySamples,
        });
      })
      .catch((err: unknown) => {
        console.error("[speedtest][ndt7] test() promise rejected", err);
        reject(err);
      });
  });

  const TIMEOUT_MS = 45_000;
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error("Network speed test timed out. Please try again.")),
      TIMEOUT_MS
    );
  });

  try {
    await Promise.race([runTestPromise, timeoutPromise]);
  } catch (err) {
    console.error("[speedtest][ndt7] failed", err);
    throw err;
  }

  if (
    !(isFinite(downloadMbps) && downloadMbps > 0) &&
    !(isFinite(uploadMbps) && uploadMbps > 0)
  ) {
    const error = new Error(
      "NDT7 test did not produce any valid throughput measurements."
    );
    console.error("[speedtest][ndt7] error (no valid measurements)", {
      downloadMbps,
      uploadMbps,
      latencyMs,
      latencySamples,
    });
    throw error;
  }

  let jitterMs = 0;
  if (latencySamples.length > 1) {
    const mean =
      latencySamples.reduce((sum, v) => sum + v, 0) / latencySamples.length;
    const variance =
      latencySamples.reduce((sum, v) => sum + (v - mean) ** 2, 0) /
      (latencySamples.length - 1);
    jitterMs = Math.sqrt(Math.max(variance, 0));
  }

  const result: NetworkSpeedResult = {
    ping: roundTo2Decimals(
      isFinite(latencyMs) && latencyMs > 0 ? latencyMs : 0
    ),
    download: roundTo2Decimals(
      isFinite(downloadMbps) && downloadMbps > 0 ? downloadMbps : 0
    ),
    upload: roundTo2Decimals(
      isFinite(uploadMbps) && uploadMbps > 0 ? uploadMbps : 0
    ),
    jitter: roundTo2Decimals(jitterMs),
    testedAt: new Date().toISOString(),
  };

  console.log("[speedtest][ndt7] final result", result);
  return result;
}

