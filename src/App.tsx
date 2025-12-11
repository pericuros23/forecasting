import { Navigate, Route, Routes, useParams } from "react-router-dom";
import ClientSelect from "./components/ClientSelect";
import InstallForm from "./components/InstallForm";
import "./App.css";

const clients = [
  { id: "publix", name: "Publix" },
  { id: "winco", name: "WinCo" },
  { id: "meijer", name: "Meijer" },
  { id: "adusa", name: "ADUSA" },
];

function InstallRoute() {
  const { clientId } = useParams();
  const client = clients.find((c) => c.id === clientId);
  if (!client) return <Navigate to="/" replace />;
  return <InstallForm clientName={client.name} />;
}

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ClientSelect clients={clients} />} />
        <Route path="/client/:clientId" element={<InstallRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
