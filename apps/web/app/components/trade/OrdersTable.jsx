import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Tabs from "../common/Tabs";
import { orders, orderTabs } from "../../data/mock";

const statusColor = {
  Open: "text-amber-400",
  Filled: "text-up",
  Canceled: "text-muted",
};

const cols = [
  "Date", "Pair", "Type", "Side", "Price", "Amount", "Filled", "Total", "Status", "Action",
];

export default function OrdersTable() {
  const [tab, setTab] = useState("Open Orders (3)");
  const tabs = orderTabs.map((t) => (t === "Open Orders" ? "Open Orders (3)" : t));

  return (
    <section className="rounded-xl border border-line bg-panel px-6 pt-4">
      <Tabs tabs={tabs} active={tab} onChange={setTab} gap="gap-9" size="text-[14px]" className="border-b border-line" />

      <div className="overflow-x-auto">
        <table className="mt-3 w-full min-w-[900px] text-left text-[12.5px]">
          <thead>
            <tr className="text-muted">
              {cols.map((c) => (
                <th key={c} className="py-2.5 pr-4 font-normal">
                  {c === "Date" ? (
                    <span className="inline-flex items-center gap-1">Date <ChevronDown size={12} /></span>
                  ) : c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i} className="border-t border-line text-slate-200">
                <td className="py-[22px] pr-4">{o.date}</td>
                <td className="pr-4">{o.pair}</td>
                <td className="pr-4">{o.type}</td>
                <td className={`pr-4 ${o.side === "Buy" ? "text-up" : "text-down"}`}>{o.side}</td>
                <td className="pr-4">{o.price}</td>
                <td className="pr-4">{o.amount}</td>
                <td className="pr-4">{o.filled}</td>
                <td className="pr-4">{o.total}</td>
                <td className={`pr-4 ${statusColor[o.status]}`}>{o.status}</td>
                <td>
                  {o.status === "Open" ? (
                    <button className="text-down hover:underline">Cancel</button>
                  ) : (
                    <span className="text-muted">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
