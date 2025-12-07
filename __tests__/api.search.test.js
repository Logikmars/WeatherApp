/**
 * @jest-environment node
 */
import { POST } from "../src/app/api/search/route";
import { NextResponse } from "next/server";

beforeEach(() => {
  jest.clearAllMocks();

  // Мок NextResponse.json так, щоб він повертав plain object
  jest.spyOn(NextResponse, "json").mockImplementation((obj) => obj);
});

test("POST returns ok:true when city found and weather fetched", async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "Kyiv", lat: 50.45, lon: 30.523 }],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ current: { temp: 10 }, hourly: [], daily: [] }),
    });

  const request = { json: async () => ({ city: "Kyiv" }) };
  const res = await POST(request);

  // Тепер POST повертає plain object через мок
  expect(res.ok).toBe(true);
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("POST returns ok:false when city not found", async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => ([]),
  });

  const request = { json: async () => ({ city: "UnknownCity" }) };
  const res = await POST(request);

  expect(res.ok).toBe(false);
});
