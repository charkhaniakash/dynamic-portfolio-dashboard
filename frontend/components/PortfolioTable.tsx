"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { EnrichedStock } from "@/types/portfolio";

const col = createColumnHelper<EnrichedStock>();

const fmt = {
  currency: (v: number | null) =>
    v == null ? "—" : `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
  percent: (v: number | null) =>
    v == null ? "—" : `${v.toFixed(2)}%`,
  number: (v: number | null) =>
    v == null ? "—" : v.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
};

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
    cell: (i) => {
      const v = i.getValue();
      const pct = i.row.original.gainLossPercent;
      if (v == null) return <span className="text-gray-500">—</span>;
      const color = v > 0 ? "text-green-400" : v < 0 ? "text-red-400" : "text-gray-400";
      return (
        <span className={color}>
          {fmt.currency(v)}{" "}
          <span className="text-xs opacity-75">({fmt.percent(pct)})</span>
        </span>
      );
    },
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

export default function PortfolioTable({ stocks }: Props) {
  const table = useReactTable({
    data: stocks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-900/50 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-3 text-right first:text-left whitespace-nowrap"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
