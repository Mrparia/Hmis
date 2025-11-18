import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { AppointmentRequest, Bill, Doctor, InventoryItem, Patient, PatientVisit, Surgery } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';

interface DashboardProps {
  setActiveView: (view: any) => void;
}

const AppointmentSchedulerModal: React.FC<{
  request: AppointmentRequest | Surgery;
  onClose: () => void;
  onConfirm: (details: { date: Date; time: string }) => void;
}> = ({ request, onClose, onConfirm }) => {
  const { state } = useAppContext();
  const { doctors, appointmentRequests } = state;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const doctor = useMemo(() => {
    if ('requestDetail' in request) { // It's an AppointmentRequest
        const doctorName = (request as AppointmentRequest).requestDetail;
        return doctors.find(d => d.name === doctorName);
    }
    if ('doctorId' in request) { // It's a Surgery
        return doctors.find(d => d.id === (request as Surgery).doctorId);
    }
    return null;
  }, [request, doctors]);

  const next15Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 15; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);
        days.push(nextDay);
    }
    return days;
  }, []);

  const isDayAvailable = (day: Date) => {
    if (!doctor || !doctor.availability || Object.keys(doctor.availability).length === 0) return true; // Default to available if no schedule is set
    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    return !!doctor.availability[dayName];
  };

  const timeSlots = useMemo(() => {
    if (!doctor || !doctor.availability || Object.keys(doctor.availability).length === 0) {
        // Fallback to original logic if no schedule is set
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                slots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return slots;
    }

    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySlots = doctor.availability[dayName];
    if (!daySlots) return [];

    const generatedSlots: string[] = [];
    const interval = 15; // 15 min slots

    daySlots.forEach(range => {
        const [start, end] = range.split('-');
        if (!start || !end) return;

        const [startHour, startMinute] = start.split(':').map(Number);
        const [endHour, endMinute] = end.split(':').map(Number);

        let currentHour = startHour;
        let currentMinute = startMinute;

        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            generatedSlots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`);
            currentMinute += interval;
            if (currentMinute >= 60) {
                currentHour++;
                currentMinute -= 60;
            }
        }
    });

    return generatedSlots;
  }, [selectedDate, doctor]);

  const bookedSlots = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return new Set(
        appointmentRequests
            .filter(app => app.status === 'Confirmed' && app.appointmentDate === dateStr)
            .map(app => app.appointmentTime)
    );
  }, [selectedDate, appointmentRequests]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time when date changes
  };

  const handleConfirm = () => {
    if (selectedTimeSlot) {
        onConfirm({ date: selectedDate, time: selectedTimeSlot });
    }
  };

  return (
    <div className="space-y-4">
        <div>
            <h4 className="font-semibold text-gray-700 mb-2">Select a Date</h4>
            <div className="flex space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
                {next15Days.map(day => {
                    const available = isDayAvailable(day);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => handleDateSelect(day)}
                            disabled={!available}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold shrink-0 transition-colors ${
                                selectedDate.toDateString() === day.toDateString()
                                    ? 'bg-primary text-white'
                                    : !available 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 hover:bg-gray-300'
                            }`}
                        >
                            <p>{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p className="text-lg">{day.getDate()}</p>
                        </button>
                    );
                })}
            </div>
        </div>
        <div>
             <h4 className="font-semibold text-gray-700 mb-2">Select an Available Time Slot</h4>
             <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-60 overflow-y-auto pr-2">
                {timeSlots.length > 0 ? timeSlots.map(slot => {
                    const isBooked = bookedSlots.has(slot);
                    const isSelected = selectedTimeSlot === slot;
                    return (
                        <button
                            key={slot}
                            disabled={isBooked}
                            onClick={() => setSelectedTimeSlot(slot)}
                            className={`p-2 rounded-md font-semibold text-sm transition-colors ${
                                isBooked
                                    ? 'bg-yellow-300 text-yellow-800 cursor-not-allowed opacity-70'
                                    : isSelected
                                    ? 'bg-green-600 text-white'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                        >
                            {slot}
                        </button>
                    )
                }) : (
                    <p className="col-span-full text-center text-gray-500 py-4">No available slots for this day.</p>
                )}
             </div>
        </div>
        <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleConfirm} disabled={!selectedTimeSlot}>
                Save
            </Button>
        </div>
    </div>
  );
};

const OperationalDashboard: React.FC<DashboardProps> = ({setActiveView}) => {
  const { state, dispatch } = useAppContext();
  const { patients, inventory, bills, surgeries, purchaseOrders, currentUser, appointmentRequests, doctors, patientVisits } = state;
  const isReceptionist = currentUser?.role === 'Receptionist';

  // State for modals
  const [isRequestsModalOpen, setRequestsModalOpen] = useState(false);
  const [isConfirmedModalOpen, setConfirmedModalOpen] = useState(false);
  const [requestToSchedule, setRequestToSchedule] = useState<AppointmentRequest | null>(null);
  const [detailsToSend, setDetailsToSend] = useState<AppointmentRequest | PatientVisit | null>(null);
  const [surgeryToSchedule, setSurgeryToSchedule] = useState<Surgery | null>(null);
  
  const patientForDetails = useMemo(() => {
    if (!detailsToSend) return null;
    let patientId: string | null = null;
    if ('patientId' in detailsToSend) {
        patientId = detailsToSend.patientId;
    } else if ('patientName' in detailsToSend) {
        // Fallback for AppointmentRequest: find patient by name (less reliable)
        const foundPatient = patients.find(p => p.name === detailsToSend.patientName);
        if (foundPatient) patientId = foundPatient.id;
    }
    if (!patientId) return null;
    return patients.find(p => p.id === patientId);
  }, [detailsToSend, patients]);

  const today = new Date().toISOString().split('T')[0];

  const todaysSales = useMemo(() => {
    return bills
      .filter((bill: Bill) => bill.billDate.startsWith(today) && bill.status === 'Finalized')
      .reduce((sum: number, bill: Bill) => sum + bill.grandTotal, 0);
  }, [bills, today]);

  const lowStockItems = useMemo(() => {
    return inventory.filter((item: InventoryItem) => {
      const totalStock = item.batches.reduce((sum, batch) => sum + batch.stock, 0);
      return totalStock > 0 && totalStock <= item.reorderLevel;
    });
  }, [inventory]);
  
  const recentPatients = useMemo(() => {
    return [...patients].sort((a,b) => new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime()).slice(0, 5);
  }, [patients]);
  
  const salesData = useMemo(() => {
    const data: { name: string, sales: number }[] = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dailySales = bills
            .filter(bill => bill.billDate.startsWith(dateStr) && bill.status === 'Finalized')
            .reduce((sum, bill) => sum + bill.grandTotal, 0);
        
        data.push({ name: dayName, sales: parseFloat(dailySales.toFixed(2)) });
    }
    return data;
  }, [bills]);

  const footfallData = useMemo(() => {
    const data: { name: string, 'New Patients': number, 'Review Patients': number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const newPatientsCount = patients.filter(p => p.registeredDate.startsWith(dateStr)).length;
      const billedPatientIds = new Set(bills.filter(b => b.billDate.startsWith(dateStr) && b.status === 'Finalized').map(b => b.patientId));
      
      let reviewPatientsCount = 0;
      for (const patientId of billedPatientIds) {
          const patient = patients.find(p => p.id === patientId);
          if (patient && !patient.registeredDate.startsWith(dateStr)) {
              reviewPatientsCount++;
          }
      }
      
      data.push({ name: dayName, 'New Patients': newPatientsCount, 'Review Patients': reviewPatientsCount });
    }
  }, [patients, bills]);

  const departmentalPerformance = useMemo(() => {
    const todaysFinalizedBills = bills.filter(bill => bill.billDate.startsWith(today) && bill.status === 'Finalized');

    const performance = {
      pharmacy: { revenue: 0, itemsSold: 0 },
      pathology: { revenue: 0, testsConducted: 0 },
      radiology: { revenue: 0, proceduresDone: 0 },
    };

    todaysFinalizedBills.forEach(bill => {
      bill.items.forEach(item => {
        const itemTotal = item.total + item.gstAmount;
        switch (item.category) {
          case 'Medicine':
          case 'Consumable':
            performance.pharmacy.revenue += itemTotal;
            performance.pharmacy.itemsSold += item.quantity;
            break;
          case 'Pathology':
            performance.pathology.revenue += itemTotal;
            performance.pathology.testsConducted += item.quantity;
            break;
          case 'Radiology':
            performance.radiology.revenue += itemTotal;
            performance.radiology.proceduresDone += item.quantity;
            break;
        }
      });
    });

    return performance;
  }, [bills, today]);

  const surgeryOverview = useMemo(() => {
    const advised = surgeries.filter(s => s.status === 'Advised').length;
    const scheduled = surgeries.filter(s => s.status === 'Scheduled').length;

    const pieData = [
      { name: 'Advised', value: advised },
      { name: 'Scheduled', value: scheduled },
    ];

    const upcoming = surgeries
      .filter(s => s.status === 'Scheduled' && s.scheduledDate)
      .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
      .slice(0, 5);

    return { pieData, upcoming };
  }, [surgeries]);
  
  const receptionistMetrics = useMemo(() => {
    const pending = appointmentRequests.filter(r => r.status === 'Pending').length;
    const confirmed = appointmentRequests.filter(r => r.status === 'Confirmed').length;
    return { pending, confirmed };
  }, [appointmentRequests]);
  
  const pendingPostOpCheckups = useMemo(() => 
    surgeries.filter(s => s.status === 'Completed'),
  [surgeries]);

  const reportsReadyForCollection = useMemo(() => 
    patientVisits.filter(v => v.status === 'Report Ready'),
  [patientVisits]);

  const todaysKpis = useMemo(() => {
    const todaysVisits = patientVisits.filter(v => v.checkInTime.startsWith(today));
    const activeConsultations = patientVisits.filter(v => v.status === 'In Consultation').length;
    const completedToday = patientVisits.filter(v => v.status === 'Completed' && v.statusUpdateTime.startsWith(today)).length;
    return {
      totalPatients: todaysVisits.length,
      activeConsultations,
      completedVisits: completedToday
    };
  }, [patientVisits, today]);


  const handleOpenScheduleModal = (request: AppointmentRequest) => {
    setRequestToSchedule(request);
  };
  
  const handleConfirmSchedule = (details: { date: Date, time: string }) => {
    if (!requestToSchedule) return;
    dispatch({
        type: 'CONFIRM_APPOINTMENT',
        payload: {
            requestId: requestToSchedule.id,
            appointmentDate: details.date.toISOString().split('T')[0],
            appointmentTime: details.time,
        },
    });
    setRequestToSchedule(null);
  };
  
  const handleConfirmPostOp = (details: { date: Date, time: string }) => {
    if (!surgeryToSchedule) return;
    dispatch({
      type: 'SCHEDULE_POST_OP',
      payload: {
        surgery: surgeryToSchedule,
        appointmentDate: details.date.toISOString().split('T')[0],
        appointmentTime: details.time,
      }
    });
    setSurgeryToSchedule(null);
  };

  const handleOpenSendDetailsModal = (request: AppointmentRequest) => {
    setDetailsToSend(request);
  };
  
  const handleOpenSendReportDetailsModal = (visit: PatientVisit) => {
    setDetailsToSend(visit);
  };

  const generateMessageBody = (detailsObject: AppointmentRequest | PatientVisit | null): string => {
    if (!detailsObject) return '';

    const isAppointmentRequest = 'requestType' in detailsObject;
    const patientName = 'patientName' in detailsObject ? detailsObject.patientName : '';
    const hospitalLocation = "https://www.google.com/maps/search/?api=1&query=12.9716,77.5946"; // Example coordinates
    let body = `Dear ${patientName},\n\n`;

    if (isAppointmentRequest) {
        const request = detailsObject as AppointmentRequest;
        body += `Your appointment has been confirmed.\n\nDetails:\n- Appointment for: ${request.requestType} - ${request.requestDetail}\n- Date: ${new Date(request.appointmentDate!).toLocaleDateString()}\n- Time: ${request.appointmentTime}\n- Location: HIMS Professional, 123 Health St, Wellness City\n- Map Link: ${hospitalLocation}\n\nPlease keep a minimum of 1 hour's time in hand for your visit.\n\n`;
    } else {
        body += `This is to inform you that your test reports are ready for collection at our facility.\n\nYou can collect them from the reception during working hours.\n\n`;
    }

    body += `Regards,\nHIMS Professional Team`;
    return body;
  };

  const handleSendViaWhatsapp = () => {
    if (!detailsToSend) return;
    const message = generateMessageBody(detailsToSend);
    const mobile = 'patientMobile' in detailsToSend ? detailsToSend.patientMobile : patientForDetails?.contact || '';
    if (!mobile) { alert('Patient contact number not available.'); return; }
    const whatsappUrl = `https://wa.me/${mobile}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleSendViaSms = () => {
    if (!detailsToSend) return;
    const message = generateMessageBody(detailsToSend);
    const mobile = 'patientMobile' in detailsToSend ? detailsToSend.patientMobile : patientForDetails?.contact || '';
    if (!mobile) { alert('Patient contact number not available.'); return; }
    const smsUrl = `sms:${mobile}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  };

  const handleSendViaMail = () => {
    if (!detailsToSend) return;
    const subject = `Appointment Confirmed at HIMS Professional`;
    const message = generateMessageBody(detailsToSend);
    const email = 'patientEmail' in detailsToSend ? detailsToSend.patientEmail : patientForDetails?.contact || '';
    if (!email || !email.includes('@')) { alert('Patient email address not available or invalid.'); return; }
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  };


  const PIE_COLORS = ['#FFBB28', '#00C49F']; // Yellow for Advised, Green for Scheduled

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="Today's Revenue" value={`₹${todaysSales.toFixed(2)}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} color="primary" onClick={() => setActiveView('REPORTS')}/>
        <Card title="Total Patients" value={patients.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.282-.237-1.887M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653-.084-1.282-.237-1.887M12 15a4 4 0 100-8 4 4 0 000 8z" /></svg>} color="secondary" onClick={() => setActiveView('PATIENTS')}/>
        
        {isReceptionist ? (
          <>
            <Card title="Web / Referral Requests" value={receptionistMetrics.pending} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>} color="accent" onClick={() => setRequestsModalOpen(true)}/>
            <Card title="Confirmed Appointments" value={receptionistMetrics.confirmed} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2 2 4-4" /></svg>} color="green" onClick={() => setConfirmedModalOpen(true)}/>
          </>
        ) : (
          <>
            <Card title="Low Stock Items" value={lowStockItems.length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} color="yellow" onClick={() => setActiveView('INVENTORY')}/>
            <Card title="Pending POs" value={purchaseOrders.filter(po => po.status === 'Pending').length} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 10h10M3 13h4" /></svg>} color="green" onClick={() => setActiveView('PROCUREMENT')}/>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Patients Today" value={todaysKpis.totalPatients} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>} color="purple" onClick={() => setActiveView('PATIENTS')}/>
        <Card title="Active Consultations" value={todaysKpis.activeConsultations} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4 4m0 0l4-4m-4 4h14m-5 4v-4a2 2 0 00-2-2h-3a2 2 0 00-2 2v4m-4-7l4-4m0 0l4 4m-4-4v12"></path></svg>} color="teal" onClick={() => setActiveView('PATIENTS')}/>
        <Card title="Completed Visits Today" value={todaysKpis.completedVisits} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} color="pink" onClick={() => setActiveView('PATIENTS')}/>
      </div>

      {isReceptionist && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Pending Post-Surgery Follow-ups ({pendingPostOpCheckups.length})</h3>
                <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Patient</th>
                                <th className="px-4 py-2">Procedure</th>
                                <th className="px-4 py-2">Doctor</th>
                                <th className="px-4 py-2">Surgery Date</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPostOpCheckups.map(s => {
                                const doctor = doctors.find(d => d.id === s.doctorId);
                                return (
                                <tr key={s.id} className="border-b">
                                    <td className="px-4 py-2 font-medium">{s.patientName}</td>
                                    <td className="px-4 py-2">{s.procedure}</td>
                                    <td className="px-4 py-2">{doctor?.name}</td>
                                    <td className="px-4 py-2">{new Date(s.scheduledDate!).toLocaleDateString()}</td>
                                    <td className="px-4 py-2"><Button className="text-xs px-2 py-1" onClick={() => setSurgeryToSchedule(s)}>Book Follow-up</Button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-surface rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Reports Ready for Collection ({reportsReadyForCollection.length})</h3>
                 <div className="overflow-x-auto max-h-72">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2">Patient</th>
                                <th className="px-4 py-2">Doctor</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportsReadyForCollection.map(v => {
                                const doctor = doctors.find(d => d.id === v.assignedDoctorId);
                                return (
                                <tr key={v.id} className="border-b">
                                    <td className="px-4 py-2 font-medium">{v.patientName}</td>
                                    <td className="px-4 py-2">{doctor?.name}</td>
                                    <td className="px-4 py-2"><Button variant="secondary" className="text-xs px-2 py-1" onClick={() => handleOpenSendReportDetailsModal(v)}>Send Details</Button></td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-primary mb-4">Live Departmental Performance (Today)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center bg-blue-50 p-4 rounded-lg">
            <div className="p-3 mr-4 text-blue-500 bg-blue-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pharmacy</p>
              <p className="text-2xl font-bold text-gray-800">₹{departmentalPerformance.pharmacy.revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{departmentalPerformance.pharmacy.itemsSold} items sold</p>
            </div>
          </div>
          <div className="flex items-center bg-green-50 p-4 rounded-lg">
            <div className="p-3 mr-4 text-green-500 bg-green-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86l.477-2.387a2 2 0 00.547-1.806z" /></svg></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Pathology</p>
              <p className="text-2xl font-bold text-gray-800">₹{departmentalPerformance.pathology.revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{departmentalPerformance.pathology.testsConducted} tests conducted</p>
            </div>
          </div>
          <div className="flex items-center bg-indigo-50 p-4 rounded-lg">
            <div className="p-3 mr-4 text-indigo-500 bg-indigo-100 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Radiology</p>
              <p className="text-2xl font-bold text-gray-800">₹{departmentalPerformance.radiology.revenue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{departmentalPerformance.radiology.proceduresDone} procedures done</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-surface rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Surgery Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={surgeryOverview.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} label>
                {surgeryOverview.pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(value: number) => `${value} surgeries`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-surface rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-primary mb-4">Upcoming Surgeries (Pipeline)</h3>
          <div className="space-y-3 overflow-y-auto max-h-[250px] pr-2">
            {surgeryOverview.upcoming.length > 0 ? (
                surgeryOverview.upcoming.map(s => (
                <div key={s.id} className="p-3 border rounded-lg bg-green-50/50">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-bold text-gray-800">{s.patientName}</p>
                            <p className="text-sm text-gray-600">{s.procedure}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-semibold text-green-700">{new Date(s.scheduledDate!).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500 pt-10">
                    <p>No surgeries in the pipeline.</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-primary mb-4">Weekly Sales</h3><ResponsiveContainer width="100%" height={300}><BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip formatter={(value: number) => `₹${value.toFixed(2)}`} /><Legend /><Bar dataKey="sales" fill="#0D47A1" name="Sales (₹)" /></BarChart></ResponsiveContainer></div>
        <div className="bg-surface rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-primary mb-4">Patient Footfall (Last 7 Days)</h3><ResponsiveContainer width="100%" height={300}><BarChart data={footfallData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="New Patients" stackId="a" fill="#42A5F5" name="New Patients" /><Bar dataKey="Review Patients" stackId="a" fill="#0D47A1" name="Review Patients" /></BarChart></ResponsiveContainer></div>
      </div>
      <div className="bg-surface rounded-xl shadow-lg p-6"><h3 className="text-xl font-bold text-primary mb-4">Recent Patients</h3><ul className="space-y-4">{recentPatients.map((patient: Patient) => (<li key={patient.id} className="flex items-center"><img src={`https://picsum.photos/seed/${patient.id}/40/40`} alt={patient.name} className="w-10 h-10 rounded-full mr-4" /><div><p className="font-semibold text-on-surface">{patient.name}</p><p className="text-sm text-gray-500">{patient.id} &bull; Registered {new Date(patient.registeredDate).toLocaleDateString()}</p></div></li>))}</ul></div>

        <Modal isOpen={isRequestsModalOpen} onClose={() => setRequestsModalOpen(false)} title="Pending Appointment Requests">
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {appointmentRequests.filter(r => r.status === 'Pending').map(req => (
                    <div key={req.id} className="p-4 border rounded-lg shadow-sm bg-gray-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg text-primary">{req.patientName}</p>
                                <p className="text-sm text-gray-600">{req.patientAddress}</p>
                                <p className="text-sm text-gray-600">{req.patientEmail} &bull; {req.patientMobile}</p>
                            </div>
                            <Button onClick={() => handleOpenScheduleModal(req)}>Confirm</Button>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                            <p><strong className="font-medium">Request:</strong> For {req.requestType} - {req.requestDetail}</p>
                            <p><strong className="font-medium">Problem:</strong> {req.problem}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>

        <Modal isOpen={isConfirmedModalOpen} onClose={() => setConfirmedModalOpen(false)} title="Confirmed Appointments">
             <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {appointmentRequests.filter(r => r.status === 'Confirmed').map(req => (
                    <div key={req.id} className="p-4 border rounded-lg shadow-sm bg-green-50">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-lg text-green-800">{req.patientName}</p>
                                {req.appointmentDate && <p className="text-sm font-semibold text-gray-700">On {new Date(req.appointmentDate).toLocaleDateString()} at {req.appointmentTime}</p>}
                                <p className="text-sm text-gray-600">{req.patientEmail} &bull; {req.patientMobile}</p>
                                <p><strong className="font-medium">Request:</strong> For {req.requestType} - {req.requestDetail}</p>
                            </div>
                            <Button onClick={() => handleOpenSendDetailsModal(req)} variant="secondary">Send Details</Button>
                        </div>
                    </div>
                ))}
            </div>
        </Modal>

        {requestToSchedule && (
            <Modal isOpen={true} onClose={() => setRequestToSchedule(null)} title={`Schedule Appointment for ${requestToSchedule.patientName}`}>
                <AppointmentSchedulerModal
                    request={requestToSchedule}
                    onClose={() => setRequestToSchedule(null)}
                    onConfirm={handleConfirmSchedule}
                />
            </Modal>
        )}
        
        {surgeryToSchedule && (
            <Modal isOpen={true} onClose={() => setSurgeryToSchedule(null)} title={`Book Follow-up for ${surgeryToSchedule.patientName}`}>
                 <AppointmentSchedulerModal
                    request={surgeryToSchedule}
                    onClose={() => setSurgeryToSchedule(null)}
                    onConfirm={handleConfirmPostOp}
                />
            </Modal>
        )}

        {detailsToSend && (
            <Modal isOpen={true} onClose={() => setDetailsToSend(null)} title={`Send Details to ${'patientName' in detailsToSend ? detailsToSend.patientName : ''}`}>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-lg text-primary mb-2">Notification Preview</h4>
                        <div className="p-4 bg-gray-100 rounded-md text-sm whitespace-pre-wrap font-mono">
                            {generateMessageBody(detailsToSend)}
                        </div>
                    </div>
                    {('requestType' in detailsToSend && detailsToSend.requestType === 'Test') && (
                        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                            <p className="font-bold text-red-600">Precautions: For most blood tests, you may be required to fast for 8-12 hours before your appointment. Please avoid eating or drinking anything other than water. For specific test instructions, please contact the lab.</p>
                        </div>
                    )}
                    <div className="flex justify-around pt-6 border-t">
                        <Button variant="secondary" onClick={handleSendViaSms}>Send via SMS</Button>
                        <Button onClick={handleSendViaWhatsapp}>Send via WhatsApp</Button>
                        <Button onClick={handleSendViaMail}>Send via Mail</Button>
                    </div>
                </div>
            </Modal>
        )}
    </div>
  );
};
export default OperationalDashboard;