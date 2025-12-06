"use client"

import './WeatherList.scss';
import { observer } from "mobx-react-lite";
import cityStore from '@/app/store/cityStore';
import WeatherCard from '../WeatherCard/WeatherCard';

const WeatherList = observer(() => {
  const { cityWeather, loading } = cityStore;

  if (loading && (!cityWeather || cityWeather.length === 0)) {
    return <p>Loading...</p>;
  }

  if (!cityWeather || cityWeather.length === 0) {
    return <p>No saved cities. Search and add a city first.</p>;
  }

  return (
    <div className="weather-list">
      {cityWeather.map(item => (
        <WeatherCard key={item.city} item={item} />
      ))}
    </div>
  );
});

export default WeatherList;
