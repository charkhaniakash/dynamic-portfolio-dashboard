"use client";

import { memo, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { EnrichedStock } from "@/types/portfolio";
import { fmt } from "@/lib/fmt";
import SectorGroup from "./SectorGroup";
import GainLossCell from "./GainLossCell";
import { selectGroupedBySector } from "@/store/portfolioStore";

const col = createColumnHelper<EnrichedStock>();

const columns = [
  col.accessor("name", {
    header: "Particulars",
    cell: (i) => <span className="font-medium">{i.getValue()}</span>,
  }),
  col.accessor("purchasePrice", {
    header: "Purchase Price",
    cell: (i) => fmt.currency(i.getValue()),
  }),
  col.accessor("qty", {
    header: "Qty",
    cell: (i) => i.getValue(),
  }),
  col.accessor("investment", {
    header: "Investment",
    cell: (i) => fmt.currency(i.getValue()),
  }),
  col.accessor("portfolioPercent", {
    header: "Portfolio %",
    cell: (i) => fmt.percent(i.getValue()),
  }),
  col.accessor("exchangeCode", {
    header: "NSE / BSE",
    cell: (i) => (
      <span className="font-mono text-xs text-gray-400">{i.getValue()}</span>
    ),
  }),
  col.accessor("cmp", {
    header: "CMP",
    cell: (i) => fmt.currency(i.getValue()),
  }),
  col.accessor("presentValue", {
    header: "Present Value",
    cell: (i) => fmt.currency(i.getValue()),
  }),
  col.accessor("gainLoss", {
    header: "Gain / Loss",
    cell: (i) => (
      <GainLossCell
        value={i.getValue()}
        percent={i.row.original.gainLossPercent}
      />
    ),
  }),
  col.accessor("peRatio", {
    header: "P/E Ratio",
    cell: (i) => fmt.number(i.getValue()),
  }),
  col.accessor("latestEarnings", {
    header: "Latest Earnings",
    cell: (i) => fmt.currency(i.getValue()),
  }),
];

interface Props {
  stocks: EnrichedStock[];
}

function PortfolioTable({ stocks }: Props) {
  const groups = useMemo(() => selectGroupedBySector(stocks), [stocks]);

  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Build a lookup from stock name → row so SectorGroup can render the correct rows
  const rowsByName = useMemo(() => {
    const map = new Map(table.getRowModel().rows.map((r) => [r.original.name, r]));
    return map;
  }, [table.getRowModel().rows]);

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800">
      <table className="w-full text-sm text-gray-300">
        <thead className="bg-gray-900 text-xs uppercase text-gray-500 tracking-wider">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-4 py-3 text-right first:text-left whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-800">
          {groups.map((group) => (
            <SectorGroup
              key={group.sector}
              sector={group.sector}
              rows={group.stocks
                .map((s) => rowsByName.get(s.name))
                .filter(Boolean) as ReturnType<typeof table.getRowModel>["rows"]}
              summary={group.summary}
              columnCount={columns.length}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(PortfolioTable);
