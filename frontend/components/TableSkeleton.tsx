const ROWS = 8;
const COLS = 11;

export default function TableSkeleton() {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-800 animate-pulse">
      <table className="w-full text-sm">
        <thead className="bg-gray-900">
          <tr>
            {Array.from({ length: COLS }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 rounded bg-gray-700 w-20 ml-auto first:ml-0" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {Array.from({ length: ROWS }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: COLS }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div className="h-3 rounded bg-gray-800 w-16 ml-auto first:ml-0" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
