import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddEquipment from './components/AddEquipment';
import EditEquipment from './components/EditEquipment';
import RecordCalibration from './components/RecordCalibration';
import Reports from './pages/Reports';
import CalibrationStatus from './pages/CalibrationStatus';
import ReportDetail from './pages/ReportDetail';
import Visualizer from './pages/Visualizer';
import Notifications from './pages/Notifications';
import UserManagement from './pages/UserManagement';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add-equipment" element={<AddEquipment />} />
          <Route path="/edit-equipment/:id" element={<EditEquipment />} />
          <Route path="/record-calibration/:id" element={<RecordCalibration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
          <Route path="/calibration-status" element={<CalibrationStatus />} />
          <Route path="/visualizer" element={<Visualizer />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
