import { describe, expect, test } from "bun:test";
import { getLocalIP } from "../src/utils/network";

describe("network utils", () => {
  test("getLocalIP returns a string", () => {
    const ip = getLocalIP();
    expect(typeof ip).toBe("string");
    expect(ip.length).toBeGreaterThan(0);
  });

  test("getLocalIP returns valid IPv4 or unavailable", () => {
    const ip = getLocalIP();
    const isIPv4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip);
    expect(isIPv4 || ip === "unavailable").toBe(true);
  });
});
