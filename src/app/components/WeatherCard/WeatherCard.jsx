// components/WeatherCard/WeatherCard.jsx
"use client"

import React from "react";

export default function WeatherCard({ item }) {
  // item = { city, current, hourly, daily, error }
  if (!item) return null;

  return (
    <div className="WeatherCard">
      <h3>{item.city}</h3>

      {item.error ? (
        <p className="error">Error: {item.error}</p>
      ) : item.current ? (
        <>
          <p>Temperature: {item.current.temp}°C</p>
          <p>Feels like: {item.current.feels_like}°C</p>
          <p>Weather: {item.current.weather?.[0]?.description}</p>
          <p>Humidity: {item.current.humidity}%</p>
          <p>Wind speed: {item.current.wind_speed} m/s</p>
        </>
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}
