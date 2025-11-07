import { useEffect, useState } from "react";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import HealthcareDashboard from "./components/HealthCareDashboard.jsx";
import axios from "axios";
function App() {
  // const [count, setCount] = useState(0)
  const [totalPatient, setTotalPatient] = useState(0);
  const [activePatients, setActivePatients] = useState(0);
  useEffect(() => {
    const getAllPatients = async () => {
      const response = await axios.get(
        "	https://healthcare-dashboard-n8rs.onrender.com/api/patients/"
      );
      setTotalPatient(response.data.length);
    };
    const getActivePatients = async () => {
      const activePatientsResponse = await axios.get(
        "https://healthcare-dashboard-n8rs.onrender.com/api/patients/active"
      );
      setActivePatients(activePatientsResponse.data.length);
    };
    getAllPatients();
    getActivePatients();
  }, []);
  return (
    <>
      <HealthcareDashboard
        totalPatient={totalPatient}
        activePatients={activePatients}
      />
    </>
  );
}

export default App;
