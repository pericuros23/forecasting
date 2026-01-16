import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  type MonthlyBreakdown,
  calculateInstallForecast,
  mergeMonthlyBreakdowns,
} from "../lib/forecastEngine";
import { type UnitType, type PricingConfig, getDailyRate } from "../lib/pricing";
import { formatCurrency } from "../lib/numberFormat";

type InstallRow = {
  id: string;
  date: string;
  quantity: number;
  unitType: UnitType;
};

function createRow(): InstallRow {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    date: "",
    quantity: 1,
    unitType: "FF",
  };
}

export function InstallForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [forecastEnd, setForecastEnd] = useState("");
  const [installCount, setInstallCount] = useState(1);
  const [rows, setRows] = useState<InstallRow[]>([createRow()]);
  const [monthly, setMonthly] = useState<MonthlyBreakdown[]>([]);
  const [perInstall, setPerInstall] = useState<{ label: string; breakdown: MonthlyBreakdown[] }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Extract pricing config from URL params
  const clientName = searchParams.get("name") || "Client";
  const mcn = searchParams.get("mcn") || "";
  const ffAnnual = parseFloat(searchParams.get("ff") || "0");
  const ncAnnual = parseFloat(searchParams.get("nc") || "0");

  const pricingConfig: PricingConfig | null = useMemo(() => {
    if (ffAnnual > 0 && ncAnnual > 0) {
      return {
        fullFunctionAnnual: ffAnnual,
        narrowCoreAnnual: ncAnnual,
      };
    }
    return null;
  }, [ffAnnual, ncAnnual]);

  // Redirect if no pricing config
  useEffect(() => {
    if (!pricingConfig) {
      navigate("/", { replace: true });
    }
  }, [pricingConfig, navigate]);

  const totalRevenue = useMemo(
    () => monthly.reduce((sum, row) => sum + row.total, 0),
    [monthly]
  );

  function syncInstallRows(count: number) {
    if (count < 1) count = 1;
    setInstallCount(count);
    setRows((prev) => {
      if (count === prev.length) return prev;
      if (count > prev.length) {
        const extra = Array.from({ length: count - prev.length }, () => createRow());
        return [...prev, ...extra];
      }
      return prev.slice(0, count);
    });
  }

  function updateRow(id: string, updates: Partial<InstallRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...updates } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, createRow()]);
    setInstallCount((c) => c + 1);
  }

  function removeRow(id: string) {
    setRows((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((row) => row.id !== id);
      setInstallCount(next.length);
      return next;
    });
  }

  function generateForecast() {
    setError(null);
    if (!forecastEnd) {
      setError("Please choose a forecast end date.");
      return;
    }
    const endDate = new Date(`${forecastEnd}T00:00:00`);

    const allBreakdowns: MonthlyBreakdown[] = [];
    const perInstallBreakdowns: { label: string; breakdown: MonthlyBreakdown[] }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.date || row.quantity <= 0) {
        continue;
      }
      const installDate = new Date(`${row.date}T00:00:00`);
      const breakdown = calculateInstallForecast(
        installDate,
        row.quantity,
        row.unitType,
        endDate,
        pricingConfig || undefined
      );
      if (breakdown.length === 0) continue;
      allBreakdowns.push(...breakdown);
      perInstallBreakdowns.push({
        label: `Install ${i + 1} (${row.unitType}, qty ${row.quantity})`,
        breakdown,
      });
    }

    setPerInstall(perInstallBreakdowns);
    setMonthly(mergeMonthlyBreakdowns(allBreakdowns));
    setExpanded(null);

    if (perInstallBreakdowns.length === 0) {
      setError("Add at least one install with a date, quantity, and end date after the install.");
    }
  }

  function exportCsv() {
    const header = "Month,FF Revenue,NC Revenue,Total";
    const lines = monthly.map(
      (row) =>
        `${row.month},${row.fullFunction.toFixed(2)},${row.narrowCore.toFixed(
          2
        )},${row.total.toFixed(2)}`
    );
    downloadFile([header, ...lines].join("\n"), "forecast.csv", "text/csv");
  }

  function exportJson() {
    const payload = { monthly, perInstall };
    downloadFile(JSON.stringify(payload, null, 2), "forecast.json", "application/json");
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="logo-center">
          <div className="logo-mark">SCO</div>
          <div className="logo-text">Forecasting Tool</div>
        </div>
      </header>

      <div className="panel">
        <button className="text-button" onClick={() => navigate("/")}>
          ← Back
        </button>
        <h1>{clientName} installs</h1>
        {pricingConfig && (
          <div className="pricing-info">
            <div className="muted">
              Full Function: ${pricingConfig.fullFunctionAnnual.toFixed(2)}/year | 
              Narrow Core: ${pricingConfig.narrowCoreAnnual.toFixed(2)}/year
            </div>
          </div>
        )}
        <div className="input-row">
          <label>
            Number of install events
            <input
              type="number"
              min={1}
              value={installCount}
              onChange={(e) => syncInstallRows(Number(e.target.value))}
            />
          </label>
          <label>
            Forecast end date
            <input
              type="date"
              value={forecastEnd}
              onChange={(e) => setForecastEnd(e.target.value)}
            />
          </label>
        </div>

        <div className="table-wrapper installs">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Install date</th>
                <th>Quantity</th>
                <th>Unit type</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(row.id, { date: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: Number(e.target.value) })}
                    />
                  </td>
                  <td>
                    <select
                      value={row.unitType}
                      onChange={(e) => updateRow(row.id, { unitType: e.target.value as UnitType })}
                    >
                      <option value="FF">Full Function</option>
                      <option value="NC">Narrow Core</option>
                    </select>
                  </td>
                  <td className="center">
                    <button className="text-button" onClick={() => removeRow(row.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="actions">
          <button onClick={addRow}>Add row</button>
          <button className="primary" onClick={generateForecast}>
            Generate Forecast
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      <div className="panel">
        <div className="stats">
          <div>
            <div className="muted">Total revenue</div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          </div>
          {pricingConfig && (
            <div className="muted small">
              Rates: FF {getDailyRate("FF", pricingConfig).toFixed(6)} /day, NC {getDailyRate("NC", pricingConfig).toFixed(6)} /day
            </div>
          )}
          {mcn && (
            <div className="muted small">
              MCN: {mcn}
            </div>
          )}
        </div>
        <div className="actions">
          <button onClick={exportCsv} disabled={monthly.length === 0}>
            Export CSV
          </button>
          <button onClick={exportJson} disabled={monthly.length === 0}>
            Export JSON
          </button>
        </div>
      </div>

      <div className="panel">
        <h2>Monthly breakdown</h2>
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
              {monthly.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatCurrency(row.fullFunction)}</td>
                  <td>{formatCurrency(row.narrowCore)}</td>
                  <td>{formatCurrency(row.total)}</td>
                </tr>
              ))}
              {monthly.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted center">
                    No forecast yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Per-install details</h2>
        {perInstall.length === 0 && <div className="muted">No installs yet.</div>}
        {perInstall.map((item, idx) => (
          <div key={idx} className="accordion">
            <button
              className="accordion-toggle"
              onClick={() => setExpanded(expanded === item.label ? null : item.label)}
            >
              <span>{item.label}</span>
              <span>{expanded === item.label ? "▾" : "▸"}</span>
            </button>
            {expanded === item.label && (
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
                    {item.breakdown.map((row) => (
                      <tr key={row.month}>
                        <td>{row.month}</td>
                        <td>{formatCurrency(row.fullFunction)}</td>
                        <td>{formatCurrency(row.narrowCore)}</td>
                        <td>{formatCurrency(row.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default InstallForm;

