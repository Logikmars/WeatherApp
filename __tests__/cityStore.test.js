/**
 * @jest-environment jsdom
 */
import cityStore from "../src/app/store/cityStore";

beforeEach(() => {
  localStorage.clear();
  cityStore.cityArr = [];
  cityStore.cityWeather = [];
  jest.clearAllMocks();
});

test("addCity adds a city and persists to localStorage", () => {
  cityStore.addCity("Kyiv");
  expect(cityStore.cityArr).toContain("Kyiv");

  const raw = JSON.parse(localStorage.getItem("cities"));
  expect(raw).toContain("Kyiv");
});

test("removeCity removes city and its weather", () => {
  cityStore.cityArr = ["Kyiv", "Lviv"];
  cityStore.cityWeather = [{ city: "Kyiv" }, { city: "Lviv" }];
  cityStore.removeCity("Kyiv");
  expect(cityStore.cityArr).not.toContain("Kyiv");
  expect(cityStore.cityWeather.find(c => c.city === "Kyiv")).toBeUndefined();
});

test("upsertCityWeather inserts and updates weather", () => {
  cityStore.upsertCityWeather({ city: "Kyiv", current: { temp: 5 } });
  expect(cityStore.cityWeather.length).toBe(1);
  expect(cityStore.cityWeather[0].current.temp).toBe(5);

  cityStore.upsertCityWeather({ city: "Kyiv", current: { temp: 7 } });
  expect(cityStore.cityWeather.length).toBe(1);
  expect(cityStore.cityWeather[0].current.temp).toBe(7);
});

test("fetchWeatherForCity handles successful response", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      ok: true,
      weather: {
        current: { temp: 10 },
        hourly: [],
        daily: []
      }
    }),
  });

  const ok = await cityStore.fetchWeatherForCity("Kyiv");
  expect(ok).toBe(true);

  const stored = cityStore.cityWeather.find(c => c.city === "Kyiv");
  expect(stored).toBeDefined();
  expect(stored.current.temp).toBe(10);
});