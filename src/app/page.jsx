"use client"

import { useEffect } from 'react';
import WeatherCard from './components/WeatherCard/WeatherCard';
import './page.scss';
import cityStore from './store/cityStore';
import WeatherList from './components/WeatherList/WeatherList';
export default () => {

    useEffect(() => {
        cityStore.getCityList();
        cityStore.fetchAllWeather();
    }, [])

    return (
        <div className='page'>
            <div className='container fcc page_content'>
                <WeatherList />
            </div>
        </div>
    )
}