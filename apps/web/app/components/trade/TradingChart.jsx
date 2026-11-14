"use client";

import { CandlestickSeries, ColorType, createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

const emptyCandles = [];

export default function TradingChart({ timeframe, candle, candles = emptyCandles }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: { background: { type: ColorType.Solid, color: "#11151c" }, textColor: "#8992a3" },
      grid: { vertLines: { color: "#1c222c" }, horzLines: { color: "#1c222c" } },
      rightPriceScale: { borderColor: "#252c38" },
      timeScale: { borderColor: "#252c38", timeVisible: true, secondsVisible: false },
      crosshair: { vertLine: { color: "#697386" }, horzLine: { color: "#697386" } },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#16c784",
      downColor: "#ea3943",
      borderVisible: false,
      wickUpColor: "#16c784",
      wickDownColor: "#ea3943",
    });
    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    seriesRef.current?.setData(candles);
    chartRef.current?.timeScale().applyOptions({ secondsVisible: timeframe === "1s" });
    if (candles.length) chartRef.current?.timeScale().fitContent();
  }, [candles, timeframe]);

  useEffect(() => {
    if (candle) {
      seriesRef.current?.update(candle);
    }
  }, [candle]);

  return <div ref={containerRef} className="h-full w-full" aria-label={`${timeframe} BTC/USDT candlestick chart`} />;
}
