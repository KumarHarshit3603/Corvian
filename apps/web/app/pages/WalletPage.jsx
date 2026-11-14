import { ArrowDownLeft, ArrowUpRight, Plus, ShieldCheck } from "lucide-react";
import {
  Button,
  CoinRows,
  holdings,
  Notice,
  PageFrame,
  Panel,
  useNotice,
} from "./shared/ExchangeUi";

export default function WalletPage({ onNavigate }) {
  const [notice, notify] = useNotice();
  return (
    <PageFrame
      title="Wallet"
      description="Manage your assets and keep track of your balances"
      action={
        <div className="flex gap-2">
          <Button
            secondary
            onClick={() =>
              notify("Withdrawal request flow is ready to connect.")
            }
          >
            <ArrowUpRight size={16} /> Withdraw
          </Button>
          <Button onClick={() => notify("Choose a deposit asset to continue.")}>
            <ArrowDownLeft size={16} /> Deposit
          </Button>
        </div>
      }
    >
      <Notice message={notice} />
      <div className="mb-5 rounded-xl border border-brand/20 bg-gradient-to-r from-[#20170f] to-panel p-6 sm:flex sm:items-center sm:justify-between">
        <div>
          <div className="text-xs text-muted">Estimated total balance</div>
          <div className="mt-2 text-3xl font-semibold text-white">
            $83,122.77{" "}
            <span className="text-base font-normal text-muted">USD</span>
          </div>
          <div className="mt-2 text-xs text-up">+ $2,184.32 (2.70%) today</div>
        </div>
        <div className="mt-4 flex gap-2 sm:mt-0">
          <Button onClick={() => notify("Choose a deposit asset to continue.")}>
            <ArrowDownLeft size={16} /> Deposit
          </Button>
          <Button
            secondary
            onClick={() =>
              notify("Withdrawal request flow is ready to connect.")
            }
          >
            <ArrowUpRight size={16} /> Withdraw
          </Button>
        </div>
      </div>
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-semibold text-white">Asset balances</h2>
            <p className="mt-1 text-xs text-muted">
              Spot wallet · {holdings.length} assets
            </p>
          </div>
          <Button secondary onClick={() => notify("Asset search selected.")}>
            <Plus size={15} /> Add asset
          </Button>
        </div>
        <CoinRows onTrade={() => onNavigate("trade")} />
      </Panel>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-panel p-4">
        <ShieldCheck className="mt-0.5 text-up" size={18} />
        <div>
          <div className="text-sm font-medium text-white">
            Your assets are protected
          </div>
          <p className="mt-1 text-xs text-muted">
            Two-factor authentication is enabled. Keep your recovery codes in a
            safe place.
          </p>
        </div>
      </div>
    </PageFrame>
  );
}
