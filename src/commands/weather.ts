import chalk from "chalk";
import ora from "ora";

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

interface AutoGeoResult {
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

interface WeatherData {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipitation: number;
  maxWind: number;
  weatherCode: number;
}

// WMO Weather interpretation codes (WW)
const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Depositing rime fog",
  51: "Drizzle: Light", 53: "Drizzle: Moderate", 55: "Drizzle: Dense",
  56: "Freezing Drizzle: Light", 57: "Freezing Drizzle: Dense",
  61: "Rain: Slight", 63: "Rain: Moderate", 65: "Rain: Heavy",
  66: "Freezing Rain: Light", 67: "Freezing Rain: Heavy",
  71: "Snow fall: Slight", 73: "Snow fall: Moderate", 75: "Snow fall: Heavy",
  77: "Snow grains",
  80: "Rain showers: Slight", 81: "Rain showers: Moderate", 82: "Rain showers: Violent",
  85: "Snow showers: Slight", 86: "Snow showers: Heavy",
  95: "Thunderstorm: Slight or moderate",
  96: "Thunderstorm with slight hail", 99: "Thunderstorm with heavy hail"
};

async function getCoordinates(city: string): Promise<GeoResult | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch coordinates");
  const data = await res.json() as { results?: GeoResult[] };
  return data.results?.[0] || null;
}

async function getAutoLocation(): Promise<AutoGeoResult> {
  const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
  if (!res.ok) throw new Error("Failed to auto-detect location");
  return await res.json() as AutoGeoResult;
}

async function getOpenMeteoWeather(lat: number, lon: number, date: string): Promise<WeatherData> {
  const today = new Date();
  const targetDate = new Date(date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let baseUrl = "https://api.open-meteo.com/v1/forecast";
  
  // Use archive for dates older than 2 days ago
  const isArchive = diffDays < -2; 
  
  if (isArchive) {
    baseUrl = "https://archive-api.open-meteo.com/v1/archive";
  }

  const url = `${baseUrl}?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch weather data: ${res.statusText}`);
  const data = await res.json();
  
  if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
    throw new Error("No weather data found for this date.");
  }

  return {
    date: data.daily.time[0],
    maxTemp: data.daily.temperature_2m_max[0],
    minTemp: data.daily.temperature_2m_min[0],
    precipitation: data.daily.precipitation_sum[0],
    maxWind: data.daily.windspeed_10m_max[0],
    weatherCode: data.daily.weathercode[0]
  };
}

function normalizeDate(dateInput: string): string {
  // Handle MM-DD format
  if (/^\d{1,2}-\d{1,2}$/.test(dateInput)) {
    const year = new Date().getFullYear();
    // Ensure padding
    const [month, day] = dateInput.split("-").map(d => d.padStart(2, "0"));
    return `${year}-${month}-${day}`;
  }
  return dateInput;
}

export async function showWeather(args: string[]) {
  // Parse args
  let locationParts: string[] = [];
  let dateInput: string | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date" || args[i] === "-d") {
      dateInput = args[i + 1];
      i++; // skip next arg
    } else {
      locationParts.push(args[i]);
    }
  }

  const location = locationParts.join(" ");

  // Mode 1: wttr.in (No date specified) -> This handles auto-location natively by wttr.in
  if (!dateInput) {
    const target = location ? location : "";
    const url = `https://wttr.in/${target}`;
    const spinner = ora(location ? `Fetching weather for ${location}...` : "Fetching local weather...").start();
    try {
      const response = await fetch(url, { headers: { "User-Agent": "curl/7.64.1" } });
      if (!response.ok) throw new Error(`Failed: ${response.statusText}`);
      const text = await response.text();
      spinner.stop();
      console.log(text);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      spinner.fail(chalk.red(`Error: ${msg}`));
    }
    return;
  }

  // Mode 2: Open-Meteo (Date specified)
  const date = normalizeDate(dateInput);

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.log(chalk.red("Error: Date must be in YYYY-MM-DD or MM-DD format."));
    return;
  }

  const spinner = ora("Resolving location...").start();
  
  try {
    let lat: number;
    let lon: number;
    let name: string;
    let country: string;

    if (location) {
      // 1a. Geocoding for provided location
      const coords = await getCoordinates(location);
      if (!coords) {
        spinner.fail(chalk.red(`Location "${location}" not found.`));
        return;
      }
      lat = coords.latitude;
      lon = coords.longitude;
      name = coords.name;
      country = coords.country;
    } else {
      // 1b. Auto-location via IP
      spinner.text = "Auto-detecting location...";
      const autoLoc = await getAutoLocation();
      lat = parseFloat(autoLoc.latitude);
      lon = parseFloat(autoLoc.longitude);
      name = autoLoc.city;
      country = autoLoc.country;
    }

    spinner.text = `Fetching weather for ${name}, ${country} on ${date}...`;

    // 2. Weather Data
    const weather = await getOpenMeteoWeather(lat, lon, date);
    spinner.stop();

    // 3. Render
    console.log("");
    console.log(chalk.bold(`  Weather Report: ${chalk.cyan(name)}, ${chalk.dim(country)}`));
    console.log(chalk.dim(`  Date: ${weather.date}`));
    console.log(chalk.dim("  " + "─".repeat(40)));
    
    const condition = WEATHER_CODES[weather.weatherCode] || "Unknown";
    console.log(`  ${chalk.yellow("Condition")}:     ${condition}`);
    console.log(`  ${chalk.red("Max Temp")}:      ${weather.maxTemp}°C`);
    console.log(`  ${chalk.blue("Min Temp")}:      ${weather.minTemp}°C`);
    console.log(`  ${chalk.cyan("Precip")}:        ${weather.precipitation} mm`);
    console.log(`  ${chalk.green("Max Wind")}:      ${weather.maxWind} km/h`);
    console.log("");
    console.log(chalk.dim("  Data provided by Open-Meteo.com"));
    console.log("");

  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    spinner.fail(chalk.red(`Error: ${msg}`));
  }
}
