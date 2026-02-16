import { describe, test, expect, mock, beforeEach, afterEach, spyOn } from "bun:test";
import { showWeather } from "../src/commands/weather";

// Mock ora to avoid spinner output cluttering tests, but capture fail/succeed
mock.module("ora", () => {
  return {
    default: () => ({
      start: () => ({
        stop: () => {},
        fail: (msg: string) => console.log(msg), // Redirect fail to console.log for spying
        succeed: (msg: string) => console.log(msg),
        text: "",
      }),
    }),
  };
});

describe("Weather Command", () => {
  let consoleLogSpy: any;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    consoleLogSpy = spyOn(console, "log").mockImplementation(() => {});
    originalFetch = global.fetch;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    global.fetch = originalFetch;
    mock.restore();
  });

  test("should call wttr.in when no args provided", async () => {
    global.fetch = mock(async (url: RequestInfo | URL) => {
      if (typeof url === "string" && url.includes("wttr.in")) {
        return new Response("Sunny 25C");
      }
      return new Response("Error", { status: 404 });
    });

    await showWeather([]);
    
    expect(global.fetch).toHaveBeenCalled();
    // Verify call arguments loosely or check output
    const calls = (global.fetch as any).mock.calls;
    expect(calls[0][0]).toContain("wttr.in");
    expect(consoleLogSpy).toHaveBeenCalledWith("Sunny 25C");
  });

  test("should call wttr.in with city when city provided", async () => {
    global.fetch = mock(async (url: RequestInfo | URL) => {
      if (typeof url === "string" && url.includes("wttr.in/London")) {
        return new Response("London Weather");
      }
      return new Response("Error", { status: 404 });
    });

    await showWeather(["London"]);
    
    expect(global.fetch).toHaveBeenCalled();
    const calls = (global.fetch as any).mock.calls;
    expect(calls[0][0]).toContain("wttr.in/London");
    expect(consoleLogSpy).toHaveBeenCalledWith("London Weather");
  });

  test("should validate date format", async () => {
    await showWeather(["--date", "invalid-date"]);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error: Date must be in YYYY-MM-DD"));
  });

  test("should use auto-location when date provided without city", async () => {
    // Mock GeoJS
    const mockGeo = mock(async (url: RequestInfo | URL) => {
      if (typeof url === "string" && url.includes("get.geojs.io")) {
        return new Response(JSON.stringify({
          city: "AutoCity",
          country: "AutoCountry",
          latitude: "10.0",
          longitude: "20.0"
        }));
      }
      // Mock Open-Meteo
      if (typeof url === "string" && url.includes("api.open-meteo.com")) {
        return new Response(JSON.stringify({
          daily: {
            time: ["2026-01-01"],
            temperature_2m_max: [30],
            temperature_2m_min: [20],
            precipitation_sum: [0],
            windspeed_10m_max: [10],
            weathercode: [0]
          }
        }));
      }
      return new Response("Error", { status: 404 });
    });
    global.fetch = mockGeo;

    await showWeather(["--date", "2026-01-01"]);

    expect(mockGeo).toHaveBeenCalledTimes(2); // GeoJS + Open-Meteo
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("AutoCity"));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("AutoCountry"));
  });

  test("should use Geocoding API when city and date provided", async () => {
    const mockFetch = mock(async (url: RequestInfo | URL) => {
      const urlStr = String(url);
      // Geocoding
      if (urlStr.includes("geocoding-api.open-meteo.com")) {
        return new Response(JSON.stringify({
          results: [{
            id: 1,
            name: "Paris",
            latitude: 48.85,
            longitude: 2.35,
            country: "France"
          }]
        }));
      }
      // Weather
      if (urlStr.includes("api.open-meteo.com")) {
        return new Response(JSON.stringify({
          daily: {
            time: ["2026-02-20"],
            temperature_2m_max: [5],
            temperature_2m_min: [0],
            precipitation_sum: [10],
            windspeed_10m_max: [20],
            weathercode: [71] // Snow
          }
        }));
      }
      return new Response("Error", { status: 404 });
    }) as any;
    global.fetch = mockFetch;

    await showWeather(["Paris", "--date", "2026-02-20"]);
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    
    // Check for presence of strings regardless of color codes
    const calls = consoleLogSpy.mock.calls.flat().join("\n");
    expect(calls).toContain("Weather Report");
    expect(calls).toContain("Paris");
    expect(calls).toContain("Snow"); // date 2026-02-20 -> Snow (71)
  });

  test("should handle API errors gracefully", async () => {
    // Mock for Geocoding (success) then Weather (failure)
    const mockFetch = mock(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.includes("geocoding-api.open-meteo.com")) {
             return new Response(JSON.stringify({
              results: [{ name: "London", latitude: 51.5, longitude: -0.1, country: "UK" }]
            }));
        }
        if (urlStr.includes("api.open-meteo.com")) {
            return {
              ok: false,
              status: 400,
              statusText: "Bad Request",
              text: async () => "Invalid Date Parameter",
            } as any;
        }
        return new Response("Error", { status: 404 });
    }) as any;

    global.fetch = mockFetch;
    
    await showWeather(["London", "--date", "2025-01-01"]);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error: Failed to fetch weather data: Bad Request - Invalid Date Parameter"));
  });

  test("should prevent forecasting > 16 days in the future", async () => {
    // Calculate a date 20 days in the future
    const future = new Date();
    future.setDate(future.getDate() + 20);
    const dateStr = future.toISOString().split("T")[0];

    await showWeather(["London", "-d", dateStr]);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining("Error: Cannot forecast more than 16 days in the future"));
  });
});
