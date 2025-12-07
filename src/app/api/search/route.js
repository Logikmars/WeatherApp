import { NextResponse } from "next/server";

export async function POST(request) {
  const key = process.env.OPENWEATHER_KEY;
  const { city } = await request.json();

  
  if (!key) {
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    const geoRes = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${key}`
    );
    const geoData = await geoRes.json();

    if (!geoData.length) {
      return NextResponse.json({ ok: false, message: "City not found" });
    }

    const { lat, lon } = geoData[0];

    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely&appid=${key}`
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      ok: true,
      city,
      weather: weatherData
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, message: "Something went wrong" });
  }
}
