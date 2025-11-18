import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { AppointmentRequest } from '../../types';
import Button from '../common/Button';

// Helper function to get all days of the week for a given date
const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);
    
    return Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        return day;
    });
};

// Helper function to compare times in HH:MM format
const isTimeInRange = (time: string, range: string): boolean => {
    const [start, end] = range.split('-');
    if (!start || !end) return false;
    return time >= start && time < end;
};

const DoctorCalendarView: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser, doctors, appointmentRequests } = state;
    const [currentDate, setCurrentDate] = useState(new Date());

    const doctor = useMemo(() => doctors.find(d => d.id === currentUser?.id), [doctors, currentUser]);
    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

    const doctorAppointments = useMemo(() => 
        appointmentRequests.filter(app => {
            const appointmentDoctor = doctors.find(d => d.name === app.requestDetail);
            return appointmentDoctor?.id === currentUser?.id && app.status === 'Confirmed';
        }), 
    [appointmentRequests, currentUser, doctors]);

    const timeSlots = useMemo(() => {
        const slots: string[] = [];
        for (let h = 8; h < 20; h++) {
            slots.push(`${String(h).padStart(2, '0')}:00`);
            slots.push(`${String(h).padStart(2, '0')}:30`);
        }
        return slots;
    }, []);

    const getSlotInfo = (day: Date, time: string): { status: 'available' | 'booked' | 'unavailable', appointment?: AppointmentRequest } => {
        if (!doctor?.availability) return { status: 'unavailable' };

        const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
        const availableRanges = doctor.availability[dayName];

        if (!availableRanges || availableRanges.length === 0) {
            return { status: 'unavailable' };
        }

        const isAvailable = availableRanges.some(range => isTimeInRange(time, range));
        if (!isAvailable) {
            return { status: 'unavailable' };
        }

        const dateString = day.toISOString().split('T')[0];
        const appointment = doctorAppointments.find(app => app.appointmentDate === dateString && app.appointmentTime?.startsWith(time.substring(0, 4)));

        if (appointment) {
            return { status: 'booked', appointment };
        }

        return { status: 'available' };
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const startOfWeek = weekDays[0];
    const endOfWeek = weekDays[6];

    return (
        <div className="bg-surface rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <Button variant="secondary" onClick={() => changeWeek('prev')}>&larr; Previous Week</Button>
                <h3 className="text-xl font-bold text-primary">
                    {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </h3>
                <Button variant="secondary" onClick={() => changeWeek('next')}>Next Week &rarr;</Button>
            </div>
            <div className="overflow-x-auto">
                <div className="grid grid-cols-8 min-w-[800px] border-l border-t">
                    {/* Header */}
                    <div className="text-center font-semibold text-gray-500 py-2 border-r border-b">Time</div>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="text-center font-semibold py-2 border-r border-b">
                            <p className="text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                            <p className="text-lg">{day.getDate()}</p>
                        </div>
                    ))}

                    {/* Body */}
                    {timeSlots.map(time => (
                        <React.Fragment key={time}>
                            <div className="text-center text-sm text-gray-500 py-2 border-r border-b">{time}</div>
                            {weekDays.map(day => {
                                const { status, appointment } = getSlotInfo(day, time);
                                let cellClass = 'border-r border-b h-20 p-1 text-xs ';
                                switch (status) {
                                    case 'available':
                                        cellClass += 'bg-green-50 hover:bg-green-100 cursor-pointer transition-colors';
                                        break;
                                    case 'booked':
                                        cellClass += 'bg-blue-100 text-blue-900 font-semibold';
                                        break;
                                    case 'unavailable':
                                        cellClass += 'bg-gray-100';
                                        break;
                                }

                                return (
                                    <div key={day.toISOString()} className={cellClass}>
                                        {appointment && (
                                            <div className="bg-blue-200 p-1 rounded h-full overflow-hidden">
                                                <p className="font-bold">{appointment.patientName}</p>
                                                <p className="text-gray-600 text-[10px]">{appointment.problem.substring(0, 30)}...</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DoctorCalendarView;
