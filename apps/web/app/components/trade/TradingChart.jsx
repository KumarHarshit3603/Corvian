/**
 * Empty mount point for TradingView lightweight-charts.
 * Pass the ref from the parent and call createChart(chartContainerRef.current, {...}) in a useEffect.
 */
export default function TradingChart({ chartContainerRef }) {
  return <div ref={chartContainerRef} className="h-full w-full" />;
}
