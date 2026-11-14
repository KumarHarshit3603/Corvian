import { ShieldCheck, Sparkles } from "lucide-react";
import CoinIcon from "../components/common/CoinIcon";
import {
  Button,
  Notice,
  PageFrame,
  Panel,
  products,
  Stat,
  useNotice,
} from "./shared/ExchangeUi";

export default function EarnPage() {
  const [notice, notify] = useNotice();
  return (
    <PageFrame
      title="Earn"
      description="Put your crypto to work with flexible rewards"
    >
      <Notice message={notice} />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Total assets subscribed"
          value="$12,480.00"
          note="Across 3 products"
        />
        <Stat
          label="Rewards earned"
          value="$284.16"
          note="↑ $18.42 this month"
        />
        <Stat label="Average APY" value="4.86%" note="Variable rates" />
      </div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Featured products</h2>
          <p className="mt-1 text-xs text-muted">
            Flexible products let you redeem any time
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-up">
          <ShieldCheck size={14} /> Principal protected
        </span>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {products.map((product) => (
          <Panel key={product.asset} className="p-5">
            <div className="flex items-center justify-between">
              <CoinIcon symbol={product.asset} color={product.color} />
              <span className="rounded-full bg-up/10 px-2.5 py-1 text-[11px] text-up">
                {product.term}
              </span>
            </div>
            <h3 className="mt-4 font-semibold text-white">{product.name}</h3>
            <p className="mt-1 text-xs text-muted">
              Earn rewards paid in {product.asset}
            </p>
            <div className="mt-5 border-t border-line pt-4">
              <div className="text-xs text-muted">Estimated APY</div>
              <div className="mt-1 text-3xl font-semibold text-up">
                {product.apy}
              </div>
              <div className="mt-3 flex justify-between text-xs text-muted">
                <span>Minimum</span>
                <span className="text-white">{product.min}</span>
              </div>
            </div>
            <Button
              onClick={() => notify(`${product.name} subscription selected.`)}
            >
              <Sparkles size={15} /> Subscribe
            </Button>
          </Panel>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted">
        Rates are estimates and may change. Digital asset products carry risk;
        review product details before subscribing.
      </p>
    </PageFrame>
  );
}
