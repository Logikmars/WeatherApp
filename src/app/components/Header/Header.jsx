"use client"

import { useState } from 'react';
import { observer } from "mobx-react-lite";
import './Header.scss';
import cityStore from '@/app/store/cityStore';

function Header() {
  const [value, setValue] = useState('');

  const validateCity = (value) => /^[A-Za-z\s]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateCity(value)) {
      console.error('String includes wrong value');
      return;
    }

    cityStore.setLoading(true);

    try {
      const success = await cityStore.fetchWeatherForCity(value);

      if (success) {
        cityStore.addCity(value);
        setValue('');
      }
    } catch (err) {
      console.error('Header submit error:', err);
    } finally {
      cityStore.setLoading(false);
    }
  };

  return (
    <div className='Header'>
      <div className='container Header_container fcc'>
        <form className='Header_form fcc' onSubmit={handleSubmit}>
          <input
            type="text"
            className='Header_input font'
            placeholder="Enter your city"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button type="submit" className='Header_btn font'>
            {cityStore.loading ? "Loading..." : "Search"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default observer(Header);
