import { useMemo, useState } from "react";
import PairHeader from "../components/trade/PairHeader";
import ChartPanel from "../components/trade/ChartPanel";
import OrderBook from "../components/trade/OrderBook";
import OrderForm from "../components/trade/OrderForm";
import RecentTrades from "../components/trade/RecentTrades";
import OrdersTable from "../components/trade/OrdersTable";
import useMarketSocket, { marketTopic } from "../hooks/useMarketSocket";

export default function TradePage() {
  const [timeframe, setTimeframe] = useState("1m");
  const topics = useMemo(() => [
    marketTopic("BTCUSDT", "orderbook"),
    marketTopic("BTCUSDT", "depth"),
    marketTopic("BTCUSDT", "trades"),
    marketTopic("BTCUSDT", "ticker"),
    marketTopic("BTCUSDT", "chart", timeframe),
  ], [timeframe]);
  const { data, status } = useMarketSocket(topics);
  const orderbook = data[marketTopic("BTCUSDT", "orderbook")];
  const depth = data[marketTopic("BTCUSDT", "depth")];
  const trades = data[marketTopic("BTCUSDT", "trades")] || [];
  const ticker = data[marketTopic("BTCUSDT", "ticker")];
  const chartData = data[marketTopic("BTCUSDT", "chart", timeframe)];
  const candle = chartData?.candle ?? chartData?.candles?.[chartData.candles.length - 1];

  return (
    <div className="p-3">
      <div className="flex flex-col gap-3">
        <PairHeader ticker={ticker} />
        <div className="grid grid-cols-[minmax(0,1fr)_286px_257px] gap-3">
          <div className="h-[540px]">
            <ChartPanel timeframe={timeframe} onTimeframeChange={setTimeframe} candle={candle} candles={chartData?.candles} />
          </div>
          <div className="h-[540px] [&>section]:h-full">
            <OrderBook orderbook={orderbook} depth={depth} trades={trades} status={status} />
          </div>
          <div className="row-span-2 flex flex-col gap-3">
            <OrderForm ticker={ticker} />
            <RecentTrades trades={trades} status={status} />
          </div>
          <div className="col-span-2">
            <OrdersTable />
          </div>
        </div>
      </div>
    </div>
  );
}
