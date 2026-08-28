"use client";

import { flexRender, Row } from "@tanstack/react-table";
import { EnrichedStock, SectorSummary } from "@/types/portfolio";
import { fmt } from "@/lib/fmt";

interface Props {
  sector: string;
  rows: Row<EnrichedStock>[];
  summary: SectorSummary;
  columnCount: number;
}

function GainLossCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-gray-500">—</span>;
  const color = value > 0 ? "text-green-400" : value < 0 ? "text-red-400" : "text-gray-400";
  return <span className={color}>{fmt.currency(value)}</span>;
}

export default function SectorGroup({ sector, rows, summary, columnCount }: Props) {
  return (
    <>
      {/* Sector header row */}
      <tr className="bg-gray-800/60">
        <td
          colSpan={columnCount}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          {sector}
        </td>
      </tr>

      {/* Stock rows */}
      {rows.map((row) => (
        <tr key={row.id} className="hover:bg-gray-900/50 transition-colors">
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

      {/* Sector summary row */}
      <tr className="bg-gray-900 border-t border-gray-700 text-xs font-medium text-gray-400">
        <td className="px-4 py-2 text-left" colSpan={3}>
          {sector} Total
        </td>
        <td className="px-4 py-2 text-right">{fmt.currency(summary.totalInvestment)}</td>
        {/* Portfolio % — not summed at sector level */}
        <td className="px-4 py-2" />
        {/* NSE/BSE, CMP — not applicable */}
        <td className="px-4 py-2" />
        <td className="px-4 py-2" />
        <td className="px-4 py-2 text-right">{fmt.currency(summary.totalPresentValue)}</td>
        <td className="px-4 py-2 text-right">
          <GainLossCell value={summary.totalGainLoss} />
        </td>
        {/* P/E, Earnings — not summed */}
        <td className="px-4 py-2" />
        <td className="px-4 py-2" />
      </tr>
    </>
  );
}
