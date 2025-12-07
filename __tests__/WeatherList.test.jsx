/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import WeatherList from "../src/app/components/WeatherList/WeatherList";
import cityStore from "../src/app/store/cityStore";
import { observer } from "mobx-react-lite";

const sampleCityWeather = [
  {
    city: "Kyiv",
    current: { temp: 5, weather: [{ description: "clear" }] },
  },
  {
    city: "Lviv",
    current: { temp: 2, weather: [{ description: "snow" }] },
  },
];

beforeEach(() => {
  cityStore.cityWeather = sampleCityWeather;
  cityStore.loading = false;
});

afterEach(() => {
  cityStore.cityWeather = [];
});

test("renders list of weather cards", () => {
  render(<WeatherList />);

  expect(screen.getByText("Kyiv")).toBeInTheDocument();
  expect(screen.getByText("Lviv")).toBeInTheDocument();
});
