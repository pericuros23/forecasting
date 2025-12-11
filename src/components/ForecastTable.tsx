import type { MonthlyBreakdown } from "../lib/forecastEngine";
import { formatCurrency } from "../lib/numberFormat";

type Props = {
  data: MonthlyBreakdown[];
  title?: string;
};

export function ForecastTable({ data, title }: Props) {
  return (
    <div className="panel">
      {title && <h2>{title}</h2>}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Month</th>
              <th>FF Revenue</th>
              <th>NC Revenue</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.month}>
                <td>{row.month}</td>
                <td>{formatCurrency(row.fullFunction)}</td>
                <td>{formatCurrency(row.narrowCore)}</td>
                <td>{formatCurrency(row.total)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="muted center">
                  No data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ForecastTable;

