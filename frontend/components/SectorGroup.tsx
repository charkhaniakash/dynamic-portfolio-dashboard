"use client";

import { flexRender, Row } from "@tanstack/react-table";
import { EnrichedStock, SectorSummary } from "@/types/portfolio";
import { fmt } from "@/lib/fmt";
import GainLossCell from "./GainLossCell";

interface Props {
  sector: string;
  rows: Row<EnrichedStock>[];
  summary: SectorSummary;
  columnCount: number;
}

export default function SectorGroup({ sector, rows, summary, columnCount }: Props) {
  return (
    <>
      <tr className="bg-gray-800/60">
        <td
          colSpan={columnCount}
          className="px-4 py-2 text-xs font-semibold uppercase tracking-widest text-gray-400"
        >
          {sector}
        </td>
      </tr>

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

      <tr className="bg-gray-900 border-t border-gray-700 text-xs font-medium text-gray-400">
        <td className="px-4 py-2 text-left" colSpan={3}>
          {sector} Total
        </td>
        <td className="px-4 py-2 text-right">{fmt.currency(summary.totalInvestment)}</td>
        <td className="px-4 py-2" />
        <td className="px-4 py-2" />
        <td className="px-4 py-2" />
        <td className="px-4 py-2 text-right">{fmt.currency(summary.totalPresentValue)}</td>
        <td className="px-4 py-2 text-right">
          <GainLossCell value={summary.totalGainLoss} />
        </td>
        <td className="px-4 py-2" />
        <td className="px-4 py-2" />
      </tr>
    </>
  );
}
