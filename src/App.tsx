import { Navigate, Route, Routes } from "react-router-dom";
import ClientPricingInput from "./components/ClientPricingInput";
import InstallForm from "./components/InstallForm";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<ClientPricingInput />} />
        <Route path="/installs" element={<InstallForm />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
