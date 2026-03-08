import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import APIDocs from "./pages/APIDocs";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/api-docs" element={<APIDocs />} />
    </Routes>
  );
}

export default App;
