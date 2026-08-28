interface Props {
  message: string;
  stale?: boolean;
}

export default function ErrorBanner({ message, stale }: Props) {
  return (
    <div className="mb-4 rounded-md border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-400">
      <span className="font-medium">Could not fetch live data</span>
      {" — "}{message}
      {stale && (
        <span className="ml-2 text-red-500/70">(showing last known values)</span>
      )}
    </div>
  );
}
