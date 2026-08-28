export const fmt = {
  currency: (v: number | null) =>
    v == null ? "—" : `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
  percent: (v: number | null) =>
    v == null ? "—" : `${v.toFixed(2)}%`,
  number: (v: number | null) =>
    v == null ? "—" : v.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
};
