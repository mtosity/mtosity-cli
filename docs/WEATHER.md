# Weather Command

The `weather` command provides weather forecasts and historical data directly in your terminal. It supports two modes of operation: **Standard** (current weather) and **Date-specific** (history/forecast).

## Usage

```bash
weather [city] [-d <date>]
```

## Modes

### 1. Standard Mode (Current Weather)
*   **Provider:** [wttr.in](https://wttr.in)
*   **Style:** Beautiful ANSI/ASCII art.
*   **Usage:**
    *   `weather` (Auto-detects location)
    *   `weather London` (Specific city)

### 2. Date Mode (History & Forecast)
*   **Provider:** [Open-Meteo](https://open-meteo.com)
*   **Style:** Clean data list with **weather icons** (☀️, 🌧️, ❄️) for conditions.
*   **Usage:**
    *   `weather -d 2025-12-25` (Auto-detects location, specific date)
    *   `weather Tokyo -d 01-01` (Specific city, specific date)
*   **Limits:** Forecasts are available for up to **16 days** in the future.

## Date Formats
The `-d` or `--date` flag accepts:
1.  **YYYY-MM-DD**: `2023-12-25` (Exact date)
2.  **MM-DD**: `12-25` (Assumes current year, e.g. 2026)

## Examples

```bash
# Check current weather in your location
weather

# Check weather in Paris
weather Paris

# Check weather for New Year's Day (Current Year)
weather -d 01-01

# Check reliable forecast/history for a specific past date
weather Berlin -d 2000-01-01
```

## Troubleshooting
*   **Location not found**: Ensure the city name is spelled correctly. New/obscure locations might need a country code (e.g., "Paris, FR").
*   **Forecast too far**: Open-Meteo supports forecasts up to 16 days ahead. Dates beyond that will show an error.
*   **Network errors**: Both modes require an active internet connection.
