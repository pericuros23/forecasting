import { useState } from "react";
import { useNavigate } from "react-router-dom";

type PricingConfig = {
  customerName: string;
  mcn: string;
  fullFunctionAnnual: number;
  narrowCoreAnnual: number;
};

export function ClientPricingInput() {
  const navigate = useNavigate();
  const [customerName, setCustomerName] = useState("");
  const [mcn, setMcn] = useState("");
  const [fullFunctionAnnual, setFullFunctionAnnual] = useState("");
  const [narrowCoreAnnual, setNarrowCoreAnnual] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError("Customer name is required");
      return;
    }

    const ffPrice = parseFloat(fullFunctionAnnual);
    const ncPrice = parseFloat(narrowCoreAnnual);

    if (isNaN(ffPrice) || ffPrice <= 0) {
      setError("Full Function price must be a positive number");
      return;
    }

    if (isNaN(ncPrice) || ncPrice <= 0) {
      setError("Narrow Core price must be a positive number");
      return;
    }

    const config: PricingConfig = {
      customerName: customerName.trim(),
      mcn: mcn.trim(),
      fullFunctionAnnual: ffPrice,
      narrowCoreAnnual: ncPrice,
    };

    // Encode pricing config in URL params
    const params = new URLSearchParams({
      name: config.customerName,
      mcn: config.mcn || "",
      ff: config.fullFunctionAnnual.toString(),
      nc: config.narrowCoreAnnual.toString(),
    });

    navigate(`/installs?${params.toString()}`);
  }

  return (
    <div className="panel">
      <div className="logo-header">
        <div className="logo-mark">SCO</div>
        <div className="logo-text">Forecasting Tool</div>
      </div>
      <p className="muted">Enter client information and pricing to start forecasting.</p>

      <form onSubmit={handleSubmit} className="pricing-form">
        <div className="form-group">
          <label>
            Customer Name <span className="required">*</span>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g., Publix, WinCo, Meijer"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            MCN (Optional)
            <input
              type="text"
              value={mcn}
              onChange={(e) => setMcn(e.target.value)}
              placeholder="Merchant Category Number"
            />
          </label>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>
              Full Function Annual Price <span className="required">*</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={fullFunctionAnnual}
                onChange={(e) => setFullFunctionAnnual(e.target.value)}
                placeholder="e.g., 1092.41"
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              Narrow Core Annual Price <span className="required">*</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={narrowCoreAnnual}
                onChange={(e) => setNarrowCoreAnnual(e.target.value)}
                placeholder="e.g., 392.41"
                required
              />
            </label>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="actions">
          <button type="submit" className="primary">
            Continue to Install Entry
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClientPricingInput;

