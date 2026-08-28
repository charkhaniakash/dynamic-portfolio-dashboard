import { memo } from "react";
import { fmt } from "@/lib/fmt";
import { gainLossColor } from "@/lib/gainLoss";

interface Props {
  value: number | null;
  percent?: number | null;
}

function GainLossCell({ value, percent }: Props) {
  if (value == null) return <span className="text-gray-500">—</span>;

  return (
    <span className={gainLossColor(value)}>
      {fmt.currency(value)}
      {percent != null && (
        <span className="ml-1 text-xs opacity-75">({fmt.percent(percent)})</span>
      )}
    </span>
  );
}

export default memo(GainLossCell);
