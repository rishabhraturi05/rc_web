/**
 * RFID Forwarder Configuration & Dispatcher
 *
 * This utility relays incoming RFID scans to external websites (fan-out relay).
 * The ESP sends 1 single request to your server, and this module asynchronously
 * forwards the exact scan data to your 3 other websites in the background.
 */

export const FORWARD_TARGETS = [
  // ---------------------------------------------------------------------------
  // TARGET 1: RC Arcade (Technozian 26) - LIVE
  // ---------------------------------------------------------------------------
  {
    id: "target_1",
    name: "RC Arcade (rc-tz-26)",
    enabled: true,
    url: "https://rc-tz-26.vercel.app/api/arcade/scan",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "rc_arcade_rfid_2026",
    },
    timeoutMs: 8000,
    // Sends rollNumber, rollNo, and rfid as specified in RC Arcade API spec
    transformPayload: (data) => ({
      rollNumber: data.rollNo || "",
      rollNo: data.rollNo || "",
      rfid: data.rfidUid || "",
      rfidUid: data.rfidUid || "",
      deviceId: data.deviceId || "BOX_1",
    }),
  },

  // ---------------------------------------------------------------------------
  // TARGET 2: Second External Website
  // ---------------------------------------------------------------------------
  {
    id: "target_2",
    name: "Website 2",
    enabled: Boolean(process.env.RFID_FORWARD_URL_2) || false,
    url: process.env.RFID_FORWARD_URL_2 || "https://website2-example.com/api/rfid",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.RFID_FORWARD_API_KEY_2
        ? { "x-api-key": process.env.RFID_FORWARD_API_KEY_2 }
        : {}),
    },
    timeoutMs: 8000,
  },

  // ---------------------------------------------------------------------------
  // TARGET 3: Third External Website
  // ---------------------------------------------------------------------------
  {
    id: "target_3",
    name: "Website 3",
    enabled: Boolean(process.env.RFID_FORWARD_URL_3) || false,
    url: process.env.RFID_FORWARD_URL_3 || "https://website3-example.com/api/rfid",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.RFID_FORWARD_API_KEY_3
        ? { "x-api-key": process.env.RFID_FORWARD_API_KEY_3 }
        : {}),
    },
    timeoutMs: 8000,
  },
];

/**
 * Returns safe summary of forwarding targets (safe to display on GET endpoints/dashboard)
 */
export function getForwardingStatus() {
  return FORWARD_TARGETS.map((target) => ({
    id: target.id,
    name: target.name,
    enabled: target.enabled,
    url: target.enabled ? target.url : "(disabled)",
    method: target.method || "POST",
    hasCustomAuth: Boolean(
      target.headers && (target.headers["x-api-key"] || target.headers["Authorization"])
    ),
  }));
}

/**
 * Forwards RFID scan payload to all enabled target websites asynchronously.
 * Uses AbortController to enforce timeout and Promise.allSettled so no target
 * failure or slowdown affects other targets or the local server.
 *
 * @param {Object} scanData - The scan data received from RFID box
 */
export async function forwardRfidScan(scanData) {
  const activeTargets = FORWARD_TARGETS.filter(
    (target) => target.enabled && target.url && !target.url.includes("example.com")
  );

  if (activeTargets.length === 0) {
    return [];
  }

  // Base payload sent to external websites: contains exact same data received from RFID
  const basePayload = {
    rollNo: scanData.rollNo || "",
    rfidUid: scanData.rfidUid || "",
    deviceId: scanData.deviceId || "BOX_1",
    timestamp: new Date().toISOString(),
    ...(scanData.rawBody || {}),
  };

  // Remove internal routing keys if present in rawBody
  delete basePayload.apiKey;

  console.log(
    `[RFID_FORWARD] Relaying scan for rollNo=${basePayload.rollNo || "N/A"} rfidUid=${basePayload.rfidUid || "N/A"} to ${activeTargets.length} external websites...`
  );

  const forwardPromises = activeTargets.map(async (target) => {
    const controller = new AbortController();
    const timeout = target.timeoutMs || 5000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const payloadToSend =
        typeof target.transformPayload === "function"
          ? target.transformPayload(basePayload)
          : basePayload;

      const response = await fetch(target.url, {
        method: target.method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...(target.headers || {}),
        },
        body: JSON.stringify(payloadToSend),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `[RFID_FORWARD] ${target.name} (${target.url}) responded with HTTP ${response.status} ${response.statusText}`
        );
        return {
          id: target.id,
          name: target.name,
          success: false,
          statusCode: response.status,
        };
      }

      console.log(`[RFID_FORWARD] Successfully delivered scan to ${target.name} (${target.url})`);
      return {
        id: target.id,
        name: target.name,
        success: true,
        statusCode: response.status,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError";
      console.error(
        `[RFID_FORWARD] Error delivering to ${target.name} (${target.url}):`,
        isTimeout ? `Request timed out after ${timeout}ms` : err.message
      );
      return {
        id: target.id,
        name: target.name,
        success: false,
        error: isTimeout ? "Timeout" : err.message,
      };
    }
  });

  return await Promise.allSettled(forwardPromises);
}
