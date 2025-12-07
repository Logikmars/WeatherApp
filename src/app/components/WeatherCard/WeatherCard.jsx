"use client"

import React, { useState, useMemo } from "react";
import "./WeatherCard.scss";
import "./WeatherModal.scss";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import cityStore from "../../store/cityStore";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

export default function WeatherCard({ item }) {
  const [open, setOpen] = useState(false);

  if (!item) return null;

  const getGradientColor = (temp) => {
    const min = -20;
    const max = 40;
    const clamped = Math.max(min, Math.min(temp, max));
    const ratio = (clamped - min) / (max - min);

    const r = Math.round(0 + ratio / 2 * (255 - 0));
    const g = Math.round(100 + ratio * 2 * (0 - 100));
    const b = Math.round(255 - ratio * (255 - 0));

    return `rgb(${r},${g},${b})`;
  };

  const hourly = item.hourly || [];
  const hourly24 = hourly.slice(0, 24);

  const chartData = useMemo(() => {
    const labels = hourly24.map(h =>
      new Date(h.dt * 1000).toLocaleTimeString("ua-UA", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Kyiv",
      })
    );

    const temps = hourly24.map(h => Math.round(h.temp));
    const pointBg = temps.map(t => getGradientColor(t));

    return {
      labels,
      datasets: [
        {
          label: "Temp, °C",
          data: temps,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          borderColor: "rgba(0,0,0,0.08)",
          backgroundColor: (ctx) => {
            return "rgba(255,165,0,0.08)";
          },
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: pointBg,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 1.5,
        },
      ],
    };
  }, [hourly24]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const v = context.parsed.y;
            return ` ${v}°C`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: {
          callback: (val) => `${val}°`,
        },
      },
    },
  };

  return (
    <>
      <div className="WeatherCard" onClick={() => setOpen(true)}>
        <h3 className="WeatherCard_title">{item.city}</h3>
        <div className="WeatherCard_content">
          <div
            className="WeatherCard_content_temp"
            style={{ color: getGradientColor(item.current.temp) }}
          >
            {item.current.temp}°C
          </div>
          <div className="WeatherCard_content_weather">
            {item.current.weather?.[0]?.description}
          </div>
        </div>
      </div>

      {open && (
        <div className="WeatherModal" onClick={() => setOpen(false)}>
          <div
            className="WeatherModal_content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="WeatherModal_content_title">{item.city}</h2>
            <div className="WeatherModal_summary">
              <p>Temperature: {item.current.temp}°C</p>
              <p>Feels like: {item.current.feels_like}°C</p>
              <p>Humidity: {item.current.humidity}%</p>
              <p>Wind: {item.current.wind_speed} m/s</p>
              <p>UVI: {item.current.uvi}</p>
            </div>

            <div className="WeatherModal_chart" style={{ height: 320 }}>
              {hourly24.length ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <p>No data for hourly</p>
              )}
            </div>
            <div className='WeatherModal_btns fcc'>
              <button className="WeatherModal_btns_el WeatherModal_btns_refresh" onClick={() => {cityStore.fetchWeatherForCity(item.city)}}>Refresh weather</button>
              <button className="WeatherModal_btns_el" onClick={() => {cityStore.removeCity(item.city)}}>Delete this city: {item.city}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
