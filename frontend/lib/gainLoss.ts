export function gainLossColor(value: number | null): string {
  if (value == null) return "text-gray-500";
  if (value > 0) return "text-green-400";
  if (value < 0) return "text-red-400";
  return "text-gray-400";
}
