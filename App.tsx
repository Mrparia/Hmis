
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { View, Bill, Prescription, SalarySlip, User, EmployeeSalary, ExperienceLetterRequest } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import Billing from './components/Billing';
import Inventory from './components/Inventory';
import Procurement from './components/Procurement';
import Reports from './components/Reports';
import Header from './components/Header';
import Doctors from './components/Doctors';
import Employees from './components/Employees';
import Login from './components/Login';
import AuditLog from './components/AuditLog';
import Settings from './components/Settings';
import { useAppContext } from './context/AppContext';
import PrintableBill from './components/PrintableBill';
import PrintablePrescription from './components/PrintablePrescription';
import PrintableSalarySlip from './components/PrintableSalarySlip';
import PrintableAppointmentLetter from './components/PrintableAppointmentLetter';
import PrintableExperienceLetter from './components/PrintableExperienceLetter';

const App: React.FC = () => {
  
  const { state, dispatch } = useAppContext();
  const { isAuthenticated, documentToPrint, currentUser } = state;
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // When user logs in, set a default view based on their role
    if(currentUser) {
        const roleDefaultView: Record<string, View> = {
            'Pharmacist': 'DASHBOARD',
            'Receptionist': 'DASHBOARD',
            'Doctor': 'DASHBOARD',
            'Paramedical': 'DASHBOARD',
            'Store Incharge': 'INVENTORY',
            'Master IT': 'SETTINGS'
        };
        setActiveView(roleDefaultView[currentUser.role] || 'DASHBOARD');
    }
  }, [currentUser]);

  useEffect(() => {
    const generatePdf = () => {
      const element = document.querySelector('.printable-content');
      if (!element || !documentToPrint) {
        if (documentToPrint) {
             console.error("Printable content not found");
             dispatch({ type: 'CLEAR_PRINT' });
        }
        return;
      }
      
      let filename = 'document.pdf';
      if (documentToPrint.data) {
          try {
              switch (documentToPrint.type) {
                case 'BILL':
                    filename = `Bill-${(documentToPrint.data as Bill).id}.pdf`;
                    break;
                case 'PRESCRIPTION':
                    filename = `Prescription-${(documentToPrint.data as Prescription).id}.pdf`;
                    break;
                case 'SALARY_SLIP':
                    const slip = documentToPrint.data as SalarySlip;
                    const month = new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'short' });
                    filename = `Payslip-${slip.userId}-${month}-${slip.year}.pdf`;
                    break;
                case 'APPOINTMENT_LETTER':
                    filename = `Appointment-Letter-${(documentToPrint.data.user as User).id}.pdf`;
                    break;
                case 'EXPERIENCE_LETTER':
                    filename = `Experience-Letter-${(documentToPrint.data.user as User).id}.pdf`;
                    break;
              }
          } catch (e) {
              console.error("Error generating filename", e);
          }
      }


      const opt = {
        margin:       0.5,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      if ((window as any).html2pdf) {
        try {
            (window as any).html2pdf().from(element).set(opt).save().then(() => {
                 dispatch({ type: 'CLEAR_PRINT' });
            }).catch((err: any) => {
                console.error("PDF generation failed", err);
                alert("Failed to generate PDF. Please try again.");
                dispatch({ type: 'CLEAR_PRINT' });
            });
        } catch (e) {
             console.error("html2pdf execution failed", e);
             dispatch({ type: 'CLEAR_PRINT' });
        }
      } else {
          console.error("html2pdf library not loaded");
          alert("PDF library not loaded. Please refresh the page.");
          dispatch({ type: 'CLEAR_PRINT' });
      }
    };

    if (documentToPrint) {
      // Small delay to ensure the portal content is rendered
      const timer = setTimeout(generatePdf, 500);
      return () => clearTimeout(timer);
    }
  }, [documentToPrint, dispatch]);
  
  if (!isAuthenticated) {
    return <Login />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'DASHBOARD':
        return <Dashboard setActiveView={setActiveView}/>;
      case 'PATIENTS':
        return <PatientManagement />;
      case 'BILLING':
        return <Billing />;
      case 'INVENTORY':
        return <Inventory />;
      case 'PROCUREMENT':
        return <Procurement />;
      case 'REPORTS':
        return <Reports />;
      case 'DOCTORS':
        return <Doctors />;
      case 'EMPLOYEES':
        return <Employees />;
      case 'AUDIT_LOG':
        return <AuditLog />;
      case 'SETTINGS':
        return <Settings />;
      default:
        return <Dashboard setActiveView={setActiveView}/>;
    }
  };
  
  const viewTitles: Record<View, string> = {
    DASHBOARD: 'Dashboard',
    PATIENTS: 'Patient Management',
    BILLING: 'Billing & Invoicing',
    INVENTORY: 'Pharmacy & Inventory',
    PROCUREMENT: 'Procurement (PO & GRN)',
    REPORTS: 'Sales & Financial Summary',
    DOCTORS: 'Doctor Management',
    EMPLOYEES: 'Employee Hub',
    AUDIT_LOG: 'System Audit Log',
    SETTINGS: 'System Settings'
  };
  
  const printContainer = document.getElementById('print-container');
  
  const renderPrintableDocument = () => {
    if (!documentToPrint || !printContainer || !documentToPrint.data) return null;
    
    let content = null;
    try {
        switch(documentToPrint.type) {
            case 'BILL':
                content = <PrintableBill bill={documentToPrint.data as Bill} />;
                break;
            case 'PRESCRIPTION':
                content = <PrintablePrescription prescription={documentToPrint.data as Prescription} />;
                break;
            case 'SALARY_SLIP':
                 content = <PrintableSalarySlip slip={documentToPrint.data as SalarySlip} />;
                 break;
            case 'APPOINTMENT_LETTER':
                 content = <PrintableAppointmentLetter user={documentToPrint.data.user as User} salary={documentToPrint.data.salary as EmployeeSalary} />;
                 break;
            case 'EXPERIENCE_LETTER':
                 content = <PrintableExperienceLetter user={documentToPrint.data.user as User} />;
                 break;
            default:
                return null;
        }
    } catch (e) {
        console.error("Error rendering printable document", e);
        return null;
    }
    
    // Using ReactDOM.createPortal for compatibility
    return ReactDOM.createPortal(content, printContainer);
  };

  return (
    <div className="flex h-screen bg-background text-on-surface font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title={viewTitles[activeView]} 
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 lg:p-8">
          {renderView()}
        </main>
      </div>
      {renderPrintableDocument()}
    </div>
  );
};

export default App;
