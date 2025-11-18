
import React from 'react';
import { useAppContext } from '../context/AppContext';
import DoctorDashboard from './dashboards/DoctorDashboard';
import HRDashboard from './dashboards/HRDashboard';
import LabDashboard from './dashboards/LabDashboard';
import OperationalDashboard from './dashboards/OperationalDashboard';
import PharmacistDashboard from './dashboards/PharmacistDashboard';

interface DashboardProps {
  setActiveView: (view: any) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const { state } = useAppContext();
  const { currentUser } = state;

  switch (currentUser?.role) {
    case 'HR':
      return <HRDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Paramedical':
      return <LabDashboard />;
    case 'Pharmacist':
      return <PharmacistDashboard />;
    case 'Admin':
    case 'Receptionist':
    case 'Store Incharge':
    case 'Nurse':
    case 'Housekeeping':
    default:
      return <OperationalDashboard setActiveView={setActiveView} />;
  }
};

export default Dashboard;