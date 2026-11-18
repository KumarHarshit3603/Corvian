import { useMemo, useState } from "react";
import PairHeader from "../components/trade/PairHeader";
import ChartPanel from "../components/trade/ChartPanel";
import OrderBook from "../components/trade/OrderBook";
import OrderForm from "../components/trade/OrderForm";
import RecentTrades from "../components/trade/RecentTrades";
import OrdersTable from "../components/trade/OrdersTable";
import useMarketSocket, { marketTopic } from "../hooks/useMarketSocket";

export default function TradePage() {
  const [pair, setPair] = useState("BTC/USDT");
  const [timeframe, setTimeframe] = useState("1m");
  const topics = useMemo(() => [
    marketTopic(pair, "orderbook"),
    marketTopic(pair, "depth"),
    marketTopic(pair, "trades"),
    marketTopic(pair, "ticker"),
    marketTopic(pair, "chart", timeframe),
  ], [pair, timeframe]);
  const { data, status } = useMarketSocket(topics);
  const orderbook = data[marketTopic(pair, "orderbook")];
  const depth = data[marketTopic(pair, "depth")];
  const trades = data[marketTopic(pair, "trades")] || [];
  const ticker = data[marketTopic(pair, "ticker")];
  const chartData = data[marketTopic(pair, "chart", timeframe)];
  const candle = chartData?.candle ?? chartData?.candles?.[chartData.candles.length - 1];

  return (
    <div className="p-3">
      <div className="flex flex-col gap-3">
        <PairHeader pair={pair} onPairChange={setPair} ticker={ticker} />
        <div className="grid grid-cols-[minmax(0,1fr)_286px_257px] gap-3">
          <div className="h-[540px]">
            <ChartPanel pair={pair} timeframe={timeframe} onTimeframeChange={setTimeframe} candle={candle} candles={chartData?.candles} />
          </div>
          <div className="h-[540px] [&>section]:h-full">
            <OrderBook pair={pair} orderbook={orderbook} depth={depth} trades={trades} status={status} />
          </div>
          <div className="row-span-2 flex flex-col gap-3">
            <OrderForm pair={pair} ticker={ticker} />
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
