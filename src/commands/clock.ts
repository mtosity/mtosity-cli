import chalk from "chalk";

interface CityTime {
  city: string;
  timezone: string;
  flag: string;
  isRequested?: boolean;
}

const CITIES: CityTime[] = [
  { city: "Sydney", timezone: "Australia/Sydney", flag: "🇦🇺" },
  { city: "Tokyo", timezone: "Asia/Tokyo", flag: "🇯🇵" },
  { city: "Singapore", timezone: "Asia/Singapore", flag: "🇸🇬" },
  { city: "Ho Chi Minh", timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  { city: "Dubai", timezone: "Asia/Dubai", flag: "🇦🇪" },
  { city: "UTC", timezone: "UTC", flag: "🌐" },
  { city: "London", timezone: "Europe/London", flag: "🇬🇧" },
  { city: "Paris", timezone: "Europe/Paris", flag: "🇫🇷" },
  { city: "New York", timezone: "America/New_York", flag: "🇺🇸" },
  { city: "San Francisco", timezone: "America/Los_Angeles", flag: "🇺🇸" },
  { city: "Honolulu", timezone: "Pacific/Honolulu", flag: "🇺🇸" },
];

// Lookup table for resolving city names to IANA timezones
const CITY_LOOKUP: Record<string, { timezone: string; flag: string }> = {
  // Americas
  "new york": { timezone: "America/New_York", flag: "🇺🇸" },
  "los angeles": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "san francisco": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "chicago": { timezone: "America/Chicago", flag: "🇺🇸" },
  "denver": { timezone: "America/Denver", flag: "🇺🇸" },
  "houston": { timezone: "America/Chicago", flag: "🇺🇸" },
  "dallas": { timezone: "America/Chicago", flag: "🇺🇸" },
  "seattle": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "miami": { timezone: "America/New_York", flag: "🇺🇸" },
  "boston": { timezone: "America/New_York", flag: "🇺🇸" },
  "atlanta": { timezone: "America/New_York", flag: "🇺🇸" },
  "raleigh": { timezone: "America/New_York", flag: "🇺🇸" },
  "washington": { timezone: "America/New_York", flag: "🇺🇸" },
  "washington dc": { timezone: "America/New_York", flag: "🇺🇸" },
  "dc": { timezone: "America/New_York", flag: "🇺🇸" },
  "las vegas": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "vegas": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "phoenix": { timezone: "America/Phoenix", flag: "🇺🇸" },
  "philadelphia": { timezone: "America/New_York", flag: "🇺🇸" },
  "detroit": { timezone: "America/Detroit", flag: "🇺🇸" },
  "san diego": { timezone: "America/Los_Angeles", flag: "🇺🇸" },
  "austin": { timezone: "America/Chicago", flag: "🇺🇸" },
  "honolulu": { timezone: "Pacific/Honolulu", flag: "🇺🇸" },
  "anchorage": { timezone: "America/Anchorage", flag: "🇺🇸" },
  "toronto": { timezone: "America/Toronto", flag: "🇨🇦" },
  "montreal": { timezone: "America/Toronto", flag: "🇨🇦" },
  "vancouver": { timezone: "America/Vancouver", flag: "🇨🇦" },
  "mexico city": { timezone: "America/Mexico_City", flag: "🇲🇽" },
  "sao paulo": { timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  "rio": { timezone: "America/Sao_Paulo", flag: "🇧🇷" },
  "buenos aires": { timezone: "America/Argentina/Buenos_Aires", flag: "🇦🇷" },
  "santiago": { timezone: "America/Santiago", flag: "🇨🇱" },
  "lima": { timezone: "America/Lima", flag: "🇵🇪" },
  "bogota": { timezone: "America/Bogota", flag: "🇨🇴" },
  // Europe
  "london": { timezone: "Europe/London", flag: "🇬🇧" },
  "dublin": { timezone: "Europe/Dublin", flag: "🇮🇪" },
  "paris": { timezone: "Europe/Paris", flag: "🇫🇷" },
  "berlin": { timezone: "Europe/Berlin", flag: "🇩🇪" },
  "frankfurt": { timezone: "Europe/Berlin", flag: "🇩🇪" },
  "munich": { timezone: "Europe/Berlin", flag: "🇩🇪" },
  "amsterdam": { timezone: "Europe/Amsterdam", flag: "🇳🇱" },
  "brussels": { timezone: "Europe/Brussels", flag: "🇧🇪" },
  "madrid": { timezone: "Europe/Madrid", flag: "🇪🇸" },
  "barcelona": { timezone: "Europe/Madrid", flag: "🇪🇸" },
  "rome": { timezone: "Europe/Rome", flag: "🇮🇹" },
  "milan": { timezone: "Europe/Rome", flag: "🇮🇹" },
  "vienne": { timezone: "Europe/Vienna", flag: "🇦🇹" },
  "vienna": { timezone: "Europe/Vienna", flag: "🇦🇹" },
  "zurich": { timezone: "Europe/Zurich", flag: "🇨Ｈ" },
  "warsaw": { timezone: "Europe/Warsaw", flag: "🇵🇱" },
  "stockholm": { timezone: "Europe/Stockholm", flag: "🇸🇪" },
  "oslo": { timezone: "Europe/Oslo", flag: "🇳🇴" },
  "copenhagen": { timezone: "Europe/Copenhagen", flag: "🇩🇰" },
  "helsinki": { timezone: "Europe/Helsinki", flag: "🇫🇮" },
  "athens": { timezone: "Europe/Athens", flag: "🇬🇷" },
  "istanbul": { timezone: "Europe/Istanbul", flag: "🇹🇷" },
  "moscow": { timezone: "Europe/Moscow", flag: "🇷🇺" },
  "kyiv": { timezone: "Europe/Kyiv", flag: "🇺🇦" },
  "kiev": { timezone: "Europe/Kyiv", flag: "🇺🇦" },
  // Asia & Oceania
  "tokyo": { timezone: "Asia/Tokyo", flag: "🇯🇵" },
  "osaka": { timezone: "Asia/Tokyo", flag: "🇯🇵" },
  "kyoto": { timezone: "Asia/Tokyo", flag: "🇯🇵" },
  "singapore": { timezone: "Asia/Singapore", flag: "🇸🇬" },
  "ho chi minh": { timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  "saigon": { timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  "hanoi": { timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  "ha noi": { timezone: "Asia/Ho_Chi_Minh", flag: "🇻🇳" },
  "bangkok": { timezone: "Asia/Bangkok", flag: "🇹🇭" },
  "jakarta": { timezone: "Asia/Jakarta", flag: "🇮🇩" },
  "bali": { timezone: "Asia/Makassar", flag: "🇮🇩" },
  "manila": { timezone: "Asia/Manila", flag: "🇵🇭" },
  "kuala lumpur": { timezone: "Asia/Kuala_Lumpur", flag: "🇲🇾" },
  "dubai": { timezone: "Asia/Dubai", flag: "🇦🇪" },
  "abu dhabi": { timezone: "Asia/Dubai", flag: "🇦🇪" },
  "doha": { timezone: "Asia/Qatar", flag: "🇶🇦" },
  "riyadh": { timezone: "Asia/Riyadh", flag: "🇸🇦" },
  "tel aviv": { timezone: "Asia/Jerusalem", flag: "🇮🇱" },
  "jerusalem": { timezone: "Asia/Jerusalem", flag: "🇮🇱" },
  "mumbai": { timezone: "Asia/Kolkata", flag: "🇮🇳" },
  "delhi": { timezone: "Asia/Kolkata", flag: "🇮🇳" },
  "bangalore": { timezone: "Asia/Kolkata", flag: "🇮🇳" },
  "beijing": { timezone: "Asia/Shanghai", flag: "🇨🇳" },
  "shanghai": { timezone: "Asia/Shanghai", flag: "🇨🇳" },
  "shenzhen": { timezone: "Asia/Shanghai", flag: "🇨🇳" },
  "hong kong": { timezone: "Asia/Hong_Kong", flag: "🇭🇰" },
  "seoul": { timezone: "Asia/Seoul", flag: "🇰🇷" },
  "taipei": { timezone: "Asia/Taipei", flag: "🇹🇼" },
  "sydney": { timezone: "Australia/Sydney", flag: "🇦🇺" },
  "melbourne": { timezone: "Australia/Melbourne", flag: "🇦🇺" },
  "brisbane": { timezone: "Australia/Brisbane", flag: "🇦🇺" },
  "perth": { timezone: "Australia/Perth", flag: "🇦🇺" },
  "adelaide": { timezone: "Australia/Adelaide", flag: "🇦🇺" },
  "auckland": { timezone: "Pacific/Auckland", flag: "🇳🇿" },
  "wellington": { timezone: "Pacific/Auckland", flag: "🇳🇿" },
  // Africa & Middle East
  "cairo": { timezone: "Africa/Cairo", flag: "🇪🇬" },
  "johannesburg": { timezone: "Africa/Johannesburg", flag: "🇿🇦" },
  "nairobi": { timezone: "Africa/Nairobi", flag: "🇰🇪" },
  // Special
  "utc": { timezone: "UTC", flag: "🌐" },
};

export function parsePlaces(args: string[]): string[] {
  const places: string[] = [];
  let i = 0;
  while (i < args.length) {
    if (args[i] === "-p" && i + 1 < args.length) {
      i++;
      // Collect words until the next -p flag or end
      const words: string[] = [];
      while (i < args.length && args[i] !== "-p") {
        words.push(args[i]);
        i++;
      }
      if (words.length > 0) {
        places.push(words.join(" "));
      }
    } else {
      i++;
    }
  }
  return places;
}

function resolvePlace(name: string): CityTime | null {
  const key = name.toLowerCase().trim();
  const entry = CITY_LOOKUP[key];
  if (!entry) return null;
  // Capitalize city name nicely
  const displayName = name.trim().replace(/\b\w/g, (c) => c.toUpperCase());
  return { city: displayName, timezone: entry.timezone, flag: entry.flag };
}

function getTimeInZone(tz: string, now: Date): { time: string; date: string; hour: number } {
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const hourFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    hour12: false,
  });

  return {
    time: timeFmt.format(now),
    date: dateFmt.format(now),
    hour: parseInt(hourFmt.format(now), 10),
  };
}

function getUtcOffset(tz: string, now: Date): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const tzPart = parts.find((p) => p.type === "timeZoneName");
  if (!tzPart) return 0;

  // Parse "GMT+7", "GMT-5", "GMT+5:30", "GMT" etc.
  const match = tzPart.value.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
  if (!match) return 0;

  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2] || "0", 10);
  const minutes = parseInt(match[3] || "0", 10);
  return sign * (hours * 60 + minutes);
}

function getDayNightIcon(hour: number): string {
  if (hour >= 6 && hour < 18) return "☀️";
  if (hour >= 18 && hour < 21) return "🌅";
  return "🌙";
}

function formatOffset(diffMinutes: number): string {
  const sign = diffMinutes >= 0 ? "+" : "";
  const hours = Math.floor(Math.abs(diffMinutes) / 60);
  const mins = Math.abs(diffMinutes) % 60;
  if (mins === 0) return `${sign}${diffMinutes >= 0 ? hours : -hours}h`;
  return `${sign}${diffMinutes >= 0 ? "" : "-"}${hours}h${mins}m`;
}

export function showClock(extraPlaces: string[] = []) {
  const now = new Date();
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localOffset = getUtcOffset(localTz, now);
  const localInfo = getTimeInZone(localTz, now);

  // Resolve extra places
  const extraCities: CityTime[] = [];
  const unknownPlaces: string[] = [];
  for (const place of extraPlaces) {
    const resolved = resolvePlace(place);
    if (resolved) {
      extraCities.push({ ...resolved, isRequested: true });
    } else {
      unknownPlaces.push(place);
    }
  }

  // Merge: default cities + extras (dedup by timezone+city)
  // Use map to create mutable copies and track requested status
  const allCities: CityTime[] = CITIES.map((c) => ({ ...c, isRequested: false }));
  
  for (const ec of extraCities) {
    const existingIndex = allCities.findIndex(
      (c) => c.timezone === ec.timezone && c.city.toLowerCase() === ec.city.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      allCities[existingIndex].isRequested = true;
    } else {
      allCities.push(ec);
    }
  }

  // Compute data for each city
  const entries = allCities.map((c) => {
    const info = getTimeInZone(c.timezone, now);
    const offset = getUtcOffset(c.timezone, now);
    const diff = offset - localOffset;
    return { ...c, ...info, offset, diff };
  });

  // Sort by UTC offset (west → east)
  entries.sort((a, b) => a.offset - b.offset);

  // Group
  const ahead = entries.filter((e) => e.diff > 0);
  const same = entries.filter((e) => e.diff === 0);
  const behind = entries.filter((e) => e.diff < 0);

  const W = 56;
  const dim = chalk.dim;
  const divider = dim("  " + "─".repeat(W));

  console.log("");
  console.log(chalk.cyan.bold("  🕐 World Clock"));
  console.log(divider);

  // Local time header
  const localCity = localTz.split("/").pop()?.replace(/_/g, " ") || localTz;
  console.log("");
  console.log(
    `  📍 ${chalk.white.bold("You")}  ${chalk.dim("·")}  ${chalk.white.bold(localCity)}  ${chalk.dim("·")}  ${chalk.green.bold(localInfo.time)}  ${chalk.dim(localInfo.date)}  ${getDayNightIcon(localInfo.hour)}`
  );
  console.log("");
  console.log(divider);

  const printGroup = (label: string, labelColor: (s: string) => string, items: typeof entries) => {
    if (items.length === 0) return;
    console.log("");
    console.log(`  ${labelColor(label)}`);
    console.log("");

    for (const e of items) {
      const offsetStr = formatOffset(e.diff);
      const offsetColored = e.diff > 0
        ? chalk.green(offsetStr.padStart(6))
        : e.diff < 0
          ? chalk.red(offsetStr.padStart(6))
          : chalk.yellow(offsetStr.padStart(6));

      const icon = getDayNightIcon(e.hour);
      // Highlight requested cities
      const rawCity = (e.flag + " " + e.city).padEnd(22);
      const cityDisplay = e.isRequested ? chalk.cyan.bold(rawCity) : rawCity;

      console.log(
        `    ${cityDisplay} ${chalk.white.bold(e.time.padEnd(9))} ${dim(e.date.padEnd(14))} ${icon}  ${offsetColored}`
      );
    }
  };

  printGroup("▲  Ahead of you", chalk.green.bold, ahead);
  printGroup("●  Same time", chalk.yellow.bold, same);
  printGroup("▼  Behind you", chalk.red.bold, behind);

  console.log("");
  console.log(divider);
  console.log(dim(`  Timezone: ${localTz}`));

  if (unknownPlaces.length > 0) {
    console.log("");
    for (const p of unknownPlaces) {
      console.log(chalk.yellow(`  ⚠  Unknown place: "${p}". Try a major city name.`));
    }
  }

  console.log("");
}
