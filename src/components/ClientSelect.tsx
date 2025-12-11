import { useNavigate } from "react-router-dom";

type Client = {
  id: string;
  name: string;
  description?: string;
};

type Props = {
  clients: Client[];
};

export function ClientSelect({ clients }: Props) {
  const navigate = useNavigate();

  return (
    <div className="panel">
      <div className="logo-header">
        <div className="logo-mark">SCO</div>
        <div className="logo-text">Forecasting Tool</div>
      </div>
      <p className="muted">Choose a client to start entering installs.</p>
      <div className="grid">
        {clients.map((client) => (
          <button
            key={client.id}
            className="card-button"
            onClick={() => navigate(`/client/${client.id}`)}
          >
            <div className="card-title">{client.name}</div>
            {client.description && (
              <div className="card-subtitle">{client.description}</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ClientSelect;

