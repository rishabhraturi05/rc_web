import fs from "fs";
import path from "path";
import { freshersEvent } from "../data/freshersConfig";

export function getResolvedTargetTimestamp() {
  let targetStr = freshersEvent?.countdownTarget || "";
  let enabled = freshersEvent?.countdownEnabled ?? true;

  // In Node environment, read directly from file on disk to bypass Node module caching during dev
  try {
    const configPath = path.join(process.cwd(), "src", "app", "freshers", "data", "freshersConfig.js");
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf8");
      const targetMatch = content.match(/countdownTarget:\s*["']([^"']+)["']/);
      if (targetMatch && targetMatch[1]) {
        targetStr = targetMatch[1];
      }
      const enabledMatch = content.match(/countdownEnabled:\s*(true|false)/);
      if (enabledMatch) {
        enabled = enabledMatch[1] === "true";
      }
    }
  } catch (err) {
    // Fallback to imported freshersEvent if filesystem read fails
  }

  if (!enabled) {
    return 0; // Disabled means unlocked
  }

  targetStr = (targetStr || "").trim();
  if (!targetStr) return 0;

  // 1. Relative minutes: e.g. "10m", "5m", "1m"
  if (/^\d+m$/i.test(targetStr)) {
    const mins = parseInt(targetStr, 10);
    return Date.now() + mins * 60 * 1000;
  }

  // 2. Relative hours & mins: e.g. "1h", "1h2m"
  if (/^(\d+)h\s*(\d+)?m?$/i.test(targetStr)) {
    const match = targetStr.match(/^(\d+)h\s*(\d+)?m?$/i);
    const hours = parseInt(match[1], 10) || 0;
    const mins = parseInt(match[2], 10) || 0;
    return Date.now() + (hours * 3600 + mins * 60) * 1000;
  }

  // 3. Simple clock time for today (e.g. "18:00" or "18:00:00")
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(targetStr)) {
    const now = new Date();
    const [hh, mm, ss = "00"] = targetStr.split(":");
    now.setHours(parseInt(hh, 10), parseInt(mm, 10), parseInt(ss, 10), 0);
    return now.getTime();
  }

  // 4. ISO date string (e.g. "2026-09-10T18:00:00+05:30")
  let parsed = new Date(targetStr).getTime();
  if (isNaN(parsed)) {
    parsed = Date.parse(targetStr);
  }

  return isNaN(parsed) ? 0 : parsed;
}

export function isCountdownActive() {
  const target = getResolvedTargetTimestamp();
  if (!target) return false;
  return Date.now() < target;
}
