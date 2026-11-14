import { useRef } from "react";
import PairHeader from "../components/trade/PairHeader";
import ChartPanel from "../components/trade/ChartPanel";
import OrderBook from "../components/trade/OrderBook";
import OrderForm from "../components/trade/OrderForm";
import RecentTrades from "../components/trade/RecentTrades";
import OrdersTable from "../components/trade/OrdersTable";

export default function TradePage() {
  const chartContainerRef = useRef(null);
  return (
    <div className="p-3">
      <div className="flex flex-col gap-3">
        <PairHeader />
        <div className="grid grid-cols-[minmax(0,1fr)_286px_257px] gap-3">
          <div className="h-[540px]">
            <ChartPanel chartContainerRef={chartContainerRef} />
          </div>
          <div className="h-[540px] [&>section]:h-full">
            <OrderBook />
          </div>
          <div className="row-span-2 flex flex-col gap-3">
            <OrderForm />
            <RecentTrades />
          </div>
          <div className="col-span-2">
            <OrdersTable />
          </div>
        </div>
      </div>
    </div>
  );
}
