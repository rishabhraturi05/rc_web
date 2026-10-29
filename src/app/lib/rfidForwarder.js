/**
 * RFID Forwarder Configuration & Dispatcher
 *
 * This utility relays incoming RFID scans to external websites (fan-out relay).
 * All endpoints and API keys are read securely from environment variables (process.env)
 * so that no sensitive URLs or secrets are ever exposed in git/source code.
 *
 * Supported Environment Variables:
 * - Target 1: RFID_FORWARD_URL_1, RFID_FORWARD_API_KEY_1, RFID_FORWARD_NAME_1
 * - Target 2: RFID_FORWARD_URL_2, RFID_FORWARD_API_KEY_2, RFID_FORWARD_NAME_2
 * - Target 3: RFID_FORWARD_URL_3, RFID_FORWARD_API_KEY_3, RFID_FORWARD_NAME_3
 */

/**
 * Dynamically resolves all active forwarding targets from environment variables
 */
export function getConfiguredTargets() {
  const targets = [];

  // Target 1
  if (process.env.RFID_FORWARD_URL_1 && process.env.RFID_FORWARD_URL_1.trim()) {
    targets.push({
      id: "target_1",
      name: process.env.RFID_FORWARD_NAME_1?.trim() || "Website 1",
      url: process.env.RFID_FORWARD_URL_1.trim(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RFID_FORWARD_API_KEY_1?.trim()
          ? { "x-api-key": process.env.RFID_FORWARD_API_KEY_1.trim() }
          : {}),
      },
      timeoutMs: 8000,
    });
  }

  // Target 2
  if (process.env.RFID_FORWARD_URL_2 && process.env.RFID_FORWARD_URL_2.trim()) {
    targets.push({
      id: "target_2",
      name: process.env.RFID_FORWARD_NAME_2?.trim() || "Website 2",
      url: process.env.RFID_FORWARD_URL_2.trim(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RFID_FORWARD_API_KEY_2?.trim()
          ? { "x-api-key": process.env.RFID_FORWARD_API_KEY_2.trim() }
          : {}),
      },
      timeoutMs: 8000,
    });
  }

  // Target 3
  if (process.env.RFID_FORWARD_URL_3 && process.env.RFID_FORWARD_URL_3.trim()) {
    targets.push({
      id: "target_3",
      name: process.env.RFID_FORWARD_NAME_3?.trim() || "Website 3",
      url: process.env.RFID_FORWARD_URL_3.trim(),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.RFID_FORWARD_API_KEY_3?.trim()
          ? { "x-api-key": process.env.RFID_FORWARD_API_KEY_3.trim() }
          : {}),
      },
      timeoutMs: 8000,
    });
  }

  return targets;
}

/**
 * Returns safe summary of forwarding targets.
 * Secret keys are NEVER exposed. URLs are masked as "(configured)" unless authorized.
 *
 * @param {boolean} isAuthorized - Whether the requesting user is authenticated
 */
export function getForwardingStatus(isAuthorized = false) {
  const activeTargets = getConfiguredTargets();

  return [1, 2, 3].map((num) => {
    const id = `target_${num}`;
    const target = activeTargets.find((t) => t.id === id);
    const isConfigured = Boolean(target);

    return {
      id,
      name: target ? target.name : `Website ${num}`,
      enabled: isConfigured,
      url: isConfigured
        ? isAuthorized
          ? target.url
          : "(configured)"
        : "(disabled)",
      method: "POST",
      hasCustomAuth: isConfigured && Boolean(target.headers["x-api-key"]),
    };
  });
}

/**
 * Forwards RFID scan payload to all enabled target websites asynchronously.
 * Uses AbortController to enforce timeout and Promise.allSettled so no target
 * failure or slowdown affects other targets or the local server.
 *
 * @param {Object} scanData - The scan data received from RFID box
 */
export async function forwardRfidScan(scanData) {
  const activeTargets = getConfiguredTargets();

  if (activeTargets.length === 0) {
    return [];
  }

  // Base payload sent to external websites:
  // Includes both rollNo & rollNumber, and both rfid & rfidUid for maximum compatibility
  const basePayload = {
    rollNo: scanData.rollNo || "",
    rollNumber: scanData.rollNo || "",
    rfid: scanData.rfidUid || "",
    rfidUid: scanData.rfidUid || "",
    deviceId: scanData.deviceId || "BOX_1",
    timestamp: new Date().toISOString(),
    ...(scanData.rawBody || {}),
  };

  // Remove internal authentication keys before relaying
  delete basePayload.apiKey;

  console.log(
    `[RFID_FORWARD] Relaying scan for rollNo=${basePayload.rollNo || "N/A"} to ${activeTargets.length} external websites...`
  );

  const forwardPromises = activeTargets.map(async (target) => {
    const controller = new AbortController();
    const timeout = target.timeoutMs || 8000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(target.url, {
        method: target.method || "POST",
        headers: target.headers,
        body: JSON.stringify(basePayload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(
          `[RFID_FORWARD] ${target.name} responded with HTTP ${response.status} ${response.statusText}`
        );
        return {
          id: target.id,
          name: target.name,
          success: false,
          statusCode: response.status,
        };
      }

      console.log(`[RFID_FORWARD] Successfully delivered scan to ${target.name}`);
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
        `[RFID_FORWARD] Error delivering to ${target.name}:`,
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
