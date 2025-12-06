import { makeAutoObservable } from "mobx";

class CityStore {
  cityArr = [];
  city = "";
  loading = false;
  cityWeather = []; // [{ city, current, hourly, daily, error }]

  constructor() {
    makeAutoObservable(this);

    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cities");
        this.cityArr = raw ? JSON.parse(raw) : [];
      }
    } catch (e) {
      console.warn("Failed to load cities:", e);
      this.cityArr = [];
    }
  }

  // Добавляем город в список (и localStorage)
  addCity(city) {
    const normalized = (city || "").trim();
    if (!normalized) return;
    const exists = this.cityArr.some(c => c.toLowerCase() === normalized.toLowerCase());
    if (!exists) {
      this.cityArr.push(normalized);
      try { localStorage.setItem("cities", JSON.stringify(this.cityArr)); } catch(e){console.warn(e)}
    }
    this.city = normalized;
  }

  // Удаляет город из cityArr и localStorage
  removeCity(city) {
    const normalized = (city || "").trim();
    if (!normalized) return;
    this.cityArr = this.cityArr.filter(c => c.toLowerCase() !== normalized.toLowerCase());
    try { localStorage.setItem("cities", JSON.stringify(this.cityArr)); } catch(e){console.warn(e)}
    // Также удаляем погодные данные для этого города (если есть)
    this.removeCityWeather(normalized);
  }

  getCityList() {
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("cities");
        this.cityArr = raw ? JSON.parse(raw) : [];
      }
    } catch (e) {
      console.warn("getCityList error:", e);
      this.cityArr = [];
    }
  }

  clearCities() {
    this.cityArr = [];
    this.cityWeather = [];
    try { localStorage.removeItem("cities"); } catch(e){console.warn(e)}
  }

  setLoading(flag) {
    this.loading = flag;
  }

  upsertCityWeather(obj) {
    const idx = this.cityWeather.findIndex(cw => cw.city.toLowerCase() === obj.city.toLowerCase());
    if (idx >= 0) {
      this.cityWeather[idx] = { ...this.cityWeather[idx], ...obj };
    } else {
      this.cityWeather.push(obj);
    }
  }

  removeCityWeather(city) {
    this.cityWeather = this.cityWeather.filter(cw => cw.city.toLowerCase() !== city.toLowerCase());
  }

  // Возвращает true если данные получены успешно, false если город не найден или ошибка
  async fetchWeatherForCity(city) {
    if (!city) return false;
    const normalized = city.trim();
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city: normalized })
      });

      const data = await res.json();

      if (res.ok && data.ok && data.weather) {
        this.upsertCityWeather({
          city: normalized,
          current: data.weather.current,
          hourly: data.weather.hourly,
          daily: data.weather.daily,
          error: null
        });
        return true;
      } else {
        // Если API говорит, что город не найден — передаём понятную ошибку
        const msg = data?.message || `Bad response (${res.status})`;
        this.upsertCityWeather({
          city: normalized,
          current: null,
          hourly: null,
          daily: null,
          error: msg
        });
        return false;
      }
    } catch (err) {
      console.error('fetchWeatherForCity error', city, err);
      this.upsertCityWeather({
        city: normalized,
        current: null,
        hourly: null,
        daily: null,
        error: err.message || 'Network error'
      });
      return false;
    }
  }

  // Запрашивает все города и удаляет те, которых API не знает (City not found)
  async fetchAllWeather() {
    if (typeof window === "undefined") return;
    if (!Array.isArray(this.cityArr) || this.cityArr.length === 0) {
      this.cityWeather = [];
      return;
    }

    this.setLoading(true);

    // выполняем параллельно
    const promises = this.cityArr.map(city => this.fetchWeatherForCity(city));
    const results = await Promise.all(promises); // массив boolean

    // Если какие-то города вернули false (не найдены) — удаляем их из списка
    // Мы используем this.cityWeather, потому что там есть поле error с сообщением API
    const notFound = this.cityWeather
      .filter(cw => cw.error && /not\s*found/i.test(cw.error))
      .map(cw => cw.city);

    if (notFound.length) {
      notFound.forEach(c => {
        console.warn(`CityStore: removing not found city "${c}" from saved list`);
        this.removeCity(c); // удаляет из cityArr, localStorage и cityWeather
      });
    }

    this.setLoading(false);
  }
}

export default new CityStore();
