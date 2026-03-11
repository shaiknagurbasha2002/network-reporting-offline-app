// Real-world, browser-based speed test (no UI concerns).
// UPDATED: This file now uses the official M-Lab NDT7 JavaScript client
// (`@m-lab/ndt7`) instead of the previous Cloudflare-based fetch logic.
// The public API (`runNetworkSpeedTest`) and the UI components that call it
// remain unchanged; only the internal implementation and data source were
// refactored to use the real NDT7 measurement service.
//
// Returns: { ping, download, upload } where:
// - ping: ms (number)
// - download: Mbps (number)
// - upload: Mbps (number)
//
// Notes:
// - Measurements vary by device/network and can be blocked by restrictive networks.
// - If any step fails, the error is thrown to the caller and should be handled
//   by the caller (e.g., SpeedTestMeter, ReportForm).

import ndt7 from "@m-lab/ndt7";

// Helper to extract Mbps from an ndt7 measurement object.
// Two common shapes:
// - SERVER measurement: { AppInfo: { ElapsedTime, NumBytes, MeanClientMbps? }, TCPInfo?, ... }
// - CLIENT measurement: { ElapsedTime, NumBytes, MeanClientMbps } (from worker ClientData)
function extractMbpsFromMeasurement(measurement) {
  if (!measurement) return 0;

  // Prefer a direct MeanClientMbps field if present.
  if (
    typeof measurement.MeanClientMbps === "number" &&
    isFinite(measurement.MeanClientMbps) &&
    measurement.MeanClientMbps > 0
  ) {
    return measurement.MeanClientMbps;
  }

  // If there is an AppInfo block, look there next.
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

  // Finally, try treating the measurement itself as {ElapsedTime, NumBytes}.
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
function extractLatencyMsFromServerMeasurement(measurement) {
  if (!measurement || !measurement.TCPInfo) return null;
  const { MinRTT } = measurement.TCPInfo;
  if (typeof MinRTT !== "number" || !isFinite(MinRTT)) return null;
  return MinRTT / 1000; // microseconds -> milliseconds
}

export async function runNetworkSpeedTest({ onStage } = {}) {
  console.log("[speedtest][ndt7] test started");

  // Basic environment / offline checks so we fail fast and cleanly.
  if (typeof window === "undefined") {
    throw new Error("Network speed test can only run in a browser context.");
  }
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You appear to be offline. Please check your connection.");
  }

  // Let the UI know we're discovering a server.
  onStage?.("discover");

  let downloadMbps = 0;
  let uploadMbps = 0;
  let latencyMs = 0;

  // We wrap ndt7.test in a Promise so callers can await a single async function.
  const runTestPromise = new Promise((resolve, reject) => {
    const config = {
      // For most browser-based app use cases, you should either:
      // - Set `userAcceptedDataPolicy: true` after showing users the M-Lab policy, OR
      // - Mark M-Lab's policy as inapplicable if it doesn't apply to your deployment.
      //
      // This app is not collecting or storing per-user test results, so we mark the
      // policy as inapplicable here. Adjust if your deployment requirements differ.
      mlabDataPolicyInapplicable: true,
      protocol: "wss",
      // Optional metadata to help M-Lab identify this client implementation.
      metadata: {
        client_name: "network-issue-reporting-app",
        client_version: "1.0.0",
      },
      // NOTE: We rely on the default worker filenames and serve them from /public:
      // - /ndt7-download-worker.js
      // - /ndt7-upload-worker.js
      // If you change these paths, update your public assets AND the config here.
    };

    const callbacks = {
      error: (errMsg) => {
        // Log but do NOT immediately reject, so partial results (e.g. download
        // succeeded but upload failed) can still be surfaced to the UI.
        console.error("[speedtest][ndt7] error callback", errMsg);
      },
      serverDiscovery: (info) => {
        console.log("[speedtest][ndt7] discovering server", info);
      },
      serverChosen: (server) => {
        console.log("[speedtest][ndt7] server chosen", server);
      },
      downloadStart: (data) => {
        console.log("[speedtest][ndt7] download start", data);
        onStage?.("download");
      },
      downloadMeasurement: ({ Source, Data }) => {
        console.log("[speedtest][ndt7] download measurement raw", {
          Source,
          Data,
        });
        if (!Data) return;

        // Use any valid Mbps we can derive from this measurement.
        const mbps = extractMbpsFromMeasurement(Data);
        if (mbps > 0) {
          downloadMbps = mbps;
        }

        // Latency comes from TCPInfo on server-side measurements when available.
        if (Source === "server") {
          const latencyCandidate = extractLatencyMsFromServerMeasurement(Data);
          if (latencyCandidate != null && latencyCandidate > 0) {
            latencyMs = latencyCandidate;
          }
        }
      },
      downloadComplete: ({ LastServerMeasurement }) => {
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
          }
        }
      },
      uploadStart: (data) => {
        console.log("[speedtest][ndt7] upload start", data);
        onStage?.("upload");
      },
      uploadMeasurement: ({ Source, Data }) => {
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
      uploadComplete: ({ LastServerMeasurement }) => {
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

    // Start the combined download+upload test. Non-zero return codes are surfaced
    // via the error callback, so here we only need to catch unexpected failures.
    ndt7
      .test(config, callbacks)
      .then((code) => {
        console.log("[speedtest][ndt7] test finished with code", code, {
          downloadMbps,
          uploadMbps,
          latencyMs,
        });
      })
      .catch((err) => {
        console.error("[speedtest][ndt7] test() promise rejected", err);
        reject(err);
      });
  });

  // Global timeout so the UI is never stuck indefinitely.
  const TIMEOUT_MS = 45_000;
  const timeoutPromise = new Promise((_, reject) => {
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

  // If no valid throughput values were ever observed, treat this as a real failure
  // so the UI can show an error state rather than silently reporting 0 Mbps.
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
    });
    throw error;
  }

  const result = {
    ping: Number(isFinite(latencyMs) && latencyMs > 0 ? Math.round(latencyMs) : 0),
    download: Number(
      isFinite(downloadMbps) && downloadMbps > 0 ? downloadMbps.toFixed(1) : 0
    ),
    upload: Number(
      isFinite(uploadMbps) && uploadMbps > 0 ? uploadMbps.toFixed(1) : 0
    ),
  };

  console.log("[speedtest][ndt7] final result", result);
  return result;
}

