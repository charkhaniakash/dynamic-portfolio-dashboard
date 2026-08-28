import { memo } from "react";
import { EnrichedStock } from "@/types/portfolio";
import { fmt } from "@/lib/fmt";
import GainLossCell from "./GainLossCell";

function MobileStockCard({ stock }: { stock: EnrichedStock }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-100">{stock.name}</span>
        <span className="font-mono text-xs text-gray-500">{stock.exchangeCode}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span className="text-gray-500">Buy Price</span>
        <span className="text-right">{fmt.currency(stock.purchasePrice)}</span>

        <span className="text-gray-500">Qty</span>
        <span className="text-right">{stock.qty}</span>

        <span className="text-gray-500">Investment</span>
        <span className="text-right">{fmt.currency(stock.investment)}</span>

        <span className="text-gray-500">CMP</span>
        <span className="text-right">{fmt.currency(stock.cmp)}</span>

        <span className="text-gray-500">Present Value</span>
        <span className="text-right">{fmt.currency(stock.presentValue)}</span>

        <span className="text-gray-500">Gain / Loss</span>
        <span className="text-right">
          <GainLossCell value={stock.gainLoss} percent={stock.gainLossPercent} />
        </span>

        <span className="text-gray-500">P/E Ratio</span>
        <span className="text-right">{fmt.number(stock.peRatio)}</span>

        <span className="text-gray-500">Earnings (EPS)</span>
        <span className="text-right">{fmt.currency(stock.latestEarnings)}</span>
      </div>
    </div>
  );
}

export default memo(MobileStockCard);
