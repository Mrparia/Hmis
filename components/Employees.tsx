import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import Button from './common/Button';
import Modal from './common/Modal';
import { LeaveRequest, RosterChangeRequest, LeaveRequestStatus, LeaveType, Applicant, ApplicantStatus, SalarySlip, Shift, DutyAssignment, RosterUpdateRequest, RosterUpdateRequestStatus, UserRole, User, EmployeeSalary, ExperienceLetterRequest } from '../types';
import Card from './common/Card';

// ----- MODALS & FORMS -----

const LeaveApplicationModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [leaveType, setLeaveType] = useState<LeaveType>('Casual');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        const newRequest: LeaveRequest = {
            id: `L${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            startDate,
            endDate,
            leaveType,
            reason,
            status: 'Pending Admin Approval',
        };
        dispatch({ type: 'APPLY_LEAVE', payload: newRequest });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Start Date</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 w-full p-2 border rounded"/></div>
                <div><label className="text-sm font-medium">End Date</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 w-full p-2 border rounded"/></div>
            </div>
            <div><label className="text-sm font-medium">Leave Type</label><select value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="mt-1 w-full p-2 border rounded bg-white"><option>Casual</option><option>Sick</option><option>Privileged</option></select></div>
            <div><label className="text-sm font-medium">Reason</label><textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} className="mt-1 w-full p-2 border rounded"/></div>
            <div className="flex justify-end pt-4"><Button type="submit">Apply for Leave</Button></div>
        </form>
    );
};

const RosterChangeModal: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [date, setDate] = useState('');
    const [requestedShift, setRequestedShift] = useState<'Morning (9AM-5PM)' | 'Evening (1PM-9PM)' | 'Night (9PM-7AM)'>('Morning (9AM-5PM)');
    const [reason, setReason] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        const newRequest: RosterChangeRequest = {
            id: `RC${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            date,
            requestedShift,
            reason,
            status: 'Pending Admin Approval'
        };
        dispatch({ type: 'REQUEST_ROSTER_CHANGE', payload: newRequest });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="text-sm font-medium">Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 w-full p-2 border rounded"/></div>
            <div><label className="text-sm font-medium">Requested Shift</label><select value={requestedShift} onChange={e => setRequestedShift(e.target.value as any)} className="mt-1 w-full p-2 border rounded bg-white"><option>Morning (9AM-5PM)</option><option>Evening (1PM-9PM)</option><option>Night (9PM-7AM)</option></select></div>
            <div><label className="text-sm font-medium">Reason</label><textarea value={reason} onChange={e => setReason(e.target.value)} required rows={3} className="mt-1 w-full p-2 border rounded"/></div>
            <div className="flex justify-end pt-4"><Button type="submit">Submit Request</Button></div>
        </form>
    );
};

const AddApplicantForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [position, setPosition] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newApplicant: Applicant = {
            id: `APP${Date.now()}`,
            name,
            positionApplied: position,
            status: 'CV Received',
            applicationDate: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_APPLICANT', payload: newApplicant });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Applicant Name" required className="w-full p-2 border rounded"/>
            <input value={position} onChange={e => setPosition(e.target.value)} placeholder="Position Applied For" required className="w-full p-2 border rounded"/>
            <div className="flex justify-end pt-4"><Button type="submit">Add Applicant</Button></div>
        </form>
    );
}

const ScheduleInterviewForm: React.FC<{applicant: Applicant, onClose: () => void}> = ({applicant, onClose}) => {
    const { state, dispatch } = useAppContext();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [interviewerId, setInterviewerId] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const interviewer = state.users.find(u => u.id === interviewerId);
        if (!interviewer) return;

        const updatedApplicant: Applicant = {
            ...applicant,
            status: 'Interview Scheduled',
            interviewDetails: {
                date,
                time,
                interviewerId,
                interviewerName: interviewer.name,
            }
        };
        dispatch({ type: 'UPDATE_APPLICANT', payload: updatedApplicant });
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full p-2 border rounded"/>
                <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full p-2 border rounded"/>
            </div>
            <select value={interviewerId} onChange={e => setInterviewerId(e.target.value)} required className="w-full p-2 border rounded bg-white">
                <option value="">-- Select Interviewer --</option>
                {state.users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
            </select>
            <div className="flex justify-end pt-4"><Button type="submit">Schedule</Button></div>
        </form>
    );
};

const FeedbackForm: React.FC<{applicant: Applicant, onClose: () => void}> = ({applicant, onClose}) => {
    const { dispatch } = useAppContext();
    const [feedback, setFeedback] = useState(applicant.feedback || '');

    const handleUpdate = (newStatus: ApplicantStatus) => {
        const updatedApplicant: Applicant = {
            ...applicant,
            status: newStatus,
            feedback,
        };
        dispatch({ type: 'UPDATE_APPLICANT', payload: updatedApplicant });
        onClose();
    };

    return (
        <div className="space-y-4">
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Enter interview feedback..." className="w-full p-2 border rounded"/>
            <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={() => handleUpdate('Interview Done')}>Save Feedback</Button>
                <div className="flex gap-2">
                    <Button variant="danger" onClick={() => handleUpdate('Rejected')}>Reject</Button>
                    <Button onClick={() => handleUpdate('Approved')}>Approve</Button>
                </div>
            </div>
        </div>
    );
};

const OnboardingForm: React.FC<{ applicant: Applicant; onClose: () => void }> = ({ applicant, onClose }) => {
    const { state, dispatch } = useAppContext();
    const { users } = state;
    const userRoles: UserRole[] = ['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Nurse', 'Paramedical', 'Housekeeping', 'Store Incharge', 'HR'];
    
    const [role, setRole] = useState<UserRole>('Nurse');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('password');
    const [basicPay, setBasicPay] = useState('30000');
    const [allowances, setAllowances] = useState([{ name: 'HRA', amount: '6000' }]);
    const [deductions, setDeductions] = useState([{ name: 'Provident Fund', amount: '1800' }]);

    useEffect(() => {
        if (applicant) {
            setUsername(applicant.name.toLowerCase().replace(/\s+/g, '.') + Math.floor(Math.random() * 100));
        }
    }, [applicant]);
    
    const handleAllowanceChange = (index: number, field: 'name' | 'amount', value: string) => {
        const newAllowances = [...allowances];
        newAllowances[index][field] = value;
        setAllowances(newAllowances);
    };

    const handleDeductionChange = (index: number, field: 'name' | 'amount', value: string) => {
        const newDeductions = [...deductions];
        newDeductions[index][field] = value;
        setDeductions(newDeductions);
    };

    const generateEmployeeId = (role: UserRole, existingUsers: User[]): string => {
        const rolePrefixMap: Partial<Record<UserRole, string>> = {
            'Doctor': 'DOC', 'Nurse': 'NUR', 'Receptionist': 'REC', 'Pharmacist': 'PHM',
            'Store Incharge': 'STO', 'HR': 'HR', 'Admin': 'ADM', 'Paramedical': 'PAR',
            'Housekeeping': 'HSE', 'Master IT': 'IT'
        };
        const prefix = rolePrefixMap[role] || 'EMP';
        const existingIds = existingUsers
            .filter(u => u.id.startsWith(`${prefix}-`))
            .map(u => parseInt(u.id.split('-')[1] || '0'))
            .sort((a, b) => b - a);

        const newIdNumber = (existingIds[0] || 0) + 1;
        return `${prefix}-${String(newIdNumber).padStart(3, '0')}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUserId = generateEmployeeId(role, users);
        const newUser: User = { id: newUserId, name: applicant.name, role, username, password, joiningDate: new Date().toISOString() };
        const newSalary: EmployeeSalary = {
            userId: newUserId,
            basicPay: Number(basicPay),
            allowances: allowances.filter(a => a.name && a.amount).map(a => ({ ...a, amount: Number(a.amount) })),
            deductions: deductions.filter(d => d.name && d.amount).map(d => ({ ...d, amount: Number(d.amount) })),
        };
        dispatch({ type: 'ONBOARD_APPLICANT', payload: { applicantId: applicant.id, newUser, newSalary } });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Employee Details</legend>
                <div><label className="text-sm">Full Name</label><input value={applicant.name} disabled className="w-full px-3 py-2 border rounded-md bg-gray-100"/></div>
                <div><label className="text-sm">Department / Role</label><select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border bg-white rounded-md">{userRoles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="text-sm">Username</label><input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/></div>
                <div><label className="text-sm">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/></div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Salary Structure</legend>
                <div className="mb-4"><label className="text-sm">Basic Pay</label><input type="number" value={basicPay} onChange={e => setBasicPay(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md"/></div>
                <div><h4 className="font-medium text-sm mb-2">Allowances</h4>{allowances.map((item, index) => (<div key={index} className="flex gap-2 mb-2"><input value={item.name} onChange={e => handleAllowanceChange(index, 'name', e.target.value)} placeholder="Allowance Name" className="w-full px-3 py-2 border rounded-md text-sm"/><input type="number" value={item.amount} onChange={e => handleAllowanceChange(index, 'amount', e.target.value)} placeholder="Amount" className="w-full px-3 py-2 border rounded-md text-sm"/></div>))}</div>
                <div className="mt-2"><h4 className="font-medium text-sm mb-2">Deductions</h4>{deductions.map((item, index) => (<div key={index} className="flex gap-2 mb-2"><input value={item.name} onChange={e => handleDeductionChange(index, 'name', e.target.value)} placeholder="Deduction Name" className="w-full px-3 py-2 border rounded-md text-sm"/><input type="number" value={item.amount} onChange={e => handleDeductionChange(index, 'amount', e.target.value)} placeholder="Amount" className="w-full px-3 py-2 border rounded-md text-sm"/></div>))}</div>
            </fieldset>

            <div className="flex justify-end pt-4"><Button type="submit">Complete Onboarding</Button></div>
        </form>
    );
};

// ----- TABS -----

const MyDocuments: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser, salarySlips, employeeSalaries, experienceLetterRequests } = state;
    const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);

    if (!currentUser) return null;

    const mySlips = salarySlips.filter(s => s.userId === currentUser.id).sort((a,b) => new Date(b.year, b.month).getTime() - new Date(a.year, a.month).getTime());
    const mySalary = employeeSalaries.find(s => s.userId === currentUser.id);
    const myExpRequest = experienceLetterRequests.find(r => r.userId === currentUser.id);

    const handleDownloadSlip = (slip: SalarySlip) => {
        dispatch({ type: 'SET_DOCUMENT_TO_PRINT', payload: { type: 'SALARY_SLIP', data: slip } });
    };

    const handleDownloadAppointmentLetter = () => {
        if (mySalary) {
            dispatch({ type: 'SET_DOCUMENT_TO_PRINT', payload: { type: 'APPOINTMENT_LETTER', data: { user: currentUser, salary: mySalary } } });
        }
    };
    
    const handleDownloadExperienceLetter = () => {
        dispatch({ type: 'SET_DOCUMENT_TO_PRINT', payload: { type: 'EXPERIENCE_LETTER', data: { user: currentUser } } });
    };

    const handleRequestExperienceLetter = () => {
        if (window.confirm("Are you sure you want to request an experience letter?")) {
            const newRequest: ExperienceLetterRequest = {
                id: `EXP${Date.now()}`,
                userId: currentUser.id,
                userName: currentUser.name,
                requestDate: new Date().toISOString(),
                status: 'Pending'
            };
            dispatch({ type: 'REQUEST_EXPERIENCE_LETTER', payload: newRequest });
        }
    };

    return (
        <div className="space-y-8">
            <div className="p-6 border rounded-xl">
                <h3 className="text-xl font-bold text-primary mb-4">Salary Slips</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {mySlips.length > 0 ? mySlips.map(slip => (
                        <div key={slip.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <p className="font-semibold">{new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })} {slip.year}</p>
                             <div className="flex items-center gap-2">
                                <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => setViewingSlip(slip)}>View</Button>
                                <Button className="text-xs px-2 py-1" onClick={() => handleDownloadSlip(slip)}>Download</Button>
                            </div>
                        </div>
                    )) : <p className="text-center text-gray-500 py-4">No salary slips found.</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-xl">
                    <h3 className="text-xl font-bold text-primary mb-4">Appointment Letter</h3>
                    <p className="text-sm text-gray-600 mb-4">Access your official appointment letter.</p>
                    <Button onClick={handleDownloadAppointmentLetter}>Download Letter</Button>
                </div>
                <div className="p-6 border rounded-xl">
                    <h3 className="text-xl font-bold text-primary mb-4">Experience Letter</h3>
                    {!myExpRequest ? (
                        <>
                            <p className="text-sm text-gray-600 mb-4">Request an experience letter from HR.</p>
                            <Button onClick={handleRequestExperienceLetter}>Request Letter</Button>
                        </>
                    ) : myExpRequest.status === 'Pending' ? (
                        <p className="font-semibold text-yellow-600 bg-yellow-100 p-3 rounded-lg">Your request is pending HR approval.</p>
                    ) : (
                         <div className="space-y-3">
                            <p className="font-semibold text-green-600 bg-green-100 p-3 rounded-lg">Your experience letter has been generated.</p>
                            <Button onClick={handleDownloadExperienceLetter}>Download Letter</Button>
                        </div>
                    )}
                </div>
            </div>
             <PayslipDetailModal slip={viewingSlip} onClose={() => setViewingSlip(null)} />
        </div>
    );
};

const MyHub: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser, dutyRoster, leaveBalances, leaveRequests } = state;
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [isRosterModalOpen, setRosterModalOpen] = useState(false);

    const myBalance = leaveBalances.find(b => b.userId === currentUser?.id);
    const myRequests = leaveRequests.filter(r => r.userId === currentUser?.id).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingShifts = dutyRoster.filter(d => {
        const dutyDate = new Date(d.date);
        return d.userId === currentUser?.id && dutyDate >= today && dutyDate <= nextWeek;
    }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatusChip = (status: LeaveRequestStatus) => {
        const styles: Record<LeaveRequestStatus, string> = {
            'Pending Admin Approval': 'bg-yellow-100 text-yellow-800',
            'Pending HR Approval': 'bg-blue-100 text-blue-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800',
        };
        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>{status}</span>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end gap-4">
                <Button onClick={() => setLeaveModalOpen(true)}>Apply for Leave</Button>
                <Button variant="secondary" onClick={() => setRosterModalOpen(true)}>Request Roster Change</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card title="Casual Leave" value={`${myBalance?.casual || 0} days`} icon={<span>CL</span>} color="secondary"/>
                <Card title="Sick Leave" value={`${myBalance?.sick || 0} days`} icon={<span>SL</span>} color="yellow"/>
                <Card title="Privileged Leave" value={`${myBalance?.privileged || 0} days`} icon={<span>PL</span>} color="green"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div>
                    <h3 className="text-xl font-bold text-primary mb-4">Upcoming Shifts (Next 7 Days)</h3>
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                        {upcomingShifts.length > 0 ? upcomingShifts.map(s => (
                            <div key={s.id} className="p-3 border rounded-lg flex justify-between">
                                <span>{new Date(s.date).toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                <span className="font-semibold">{s.shift}</span>
                            </div>
                        )) : <p className="text-center text-gray-500 py-4">No upcoming shifts assigned.</p>}
                    </div>
                </div>
                 <div>
                    <h3 className="text-xl font-bold text-primary mb-4">My Leave Requests</h3>
                     <div className="space-y-2 max-h-60 overflow-y-auto">
                        {myRequests.map(r => (
                            <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{new Date(r.startDate).toLocaleDateString()} - {new Date(r.endDate).toLocaleDateString()}</p>
                                    <p className="text-sm text-gray-500">{r.leaveType} Leave</p>
                                </div>
                                {getStatusChip(r.status)}
                            </div>
                        ))}
                         {myRequests.length === 0 && <p className="text-center text-gray-500 py-4">No leave requests found.</p>}
                    </div>
                </div>
            </div>

            <Modal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Apply for Leave">
                <LeaveApplicationModal onClose={() => setLeaveModalOpen(false)} />
            </Modal>
             <Modal isOpen={isRosterModalOpen} onClose={() => setRosterModalOpen(false)} title="Request Roster Change">
                <RosterChangeModal onClose={() => setRosterModalOpen(false)} />
            </Modal>
        </div>
    );
};

const ApprovalSection: React.FC<{title: string, requests: any[], children: (req: any) => React.ReactNode}> = ({title, requests, children}) => {
    if (requests.length === 0) return null;

    return (
        <div>
            <h3 className="text-xl font-bold text-primary mb-4">{title} ({requests.length})</h3>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Employee</th>
                            <th className="px-6 py-3">Dates / Period</th>
                            <th className="px-6 py-3">Type / Details</th>
                            <th className="px-6 py-3">Reason</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>{requests.map(children)}</tbody>
                </table>
            </div>
        </div>
    );
};

const Approvals: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { leaveRequests, rosterChangeRequests, rosterUpdateRequests, experienceLetterRequests, currentUser } = state;

    const handleLeaveUpdate = (id: string, currentStatus: LeaveRequestStatus) => {
        let newStatus: LeaveRequestStatus = currentStatus;
        if (currentUser?.role === 'Admin' && currentStatus === 'Pending Admin Approval') newStatus = 'Pending HR Approval';
        else if (currentUser?.role === 'HR' && currentStatus === 'Pending HR Approval') newStatus = 'Approved';
        dispatch({ type: 'UPDATE_LEAVE_STATUS', payload: { id, status: newStatus } });
    };

    const handleRosterChangeUpdate = (id: string, currentStatus: LeaveRequestStatus) => {
        let newStatus: LeaveRequestStatus = currentStatus;
        if (currentUser?.role === 'Admin' && currentStatus === 'Pending Admin Approval') newStatus = 'Pending HR Approval';
        else if (currentUser?.role === 'HR' && currentStatus === 'Pending HR Approval') newStatus = 'Approved';
        dispatch({ type: 'UPDATE_ROSTER_CHANGE_STATUS', payload: { id, status: newStatus } });
    };
    
    const handleExperienceLetterGenerate = (requestId: string) => {
        dispatch({ type: 'GENERATE_EXPERIENCE_LETTER', payload: { requestId }});
    };

    const handleRosterUpdateApproval = (id: string, status: RosterUpdateRequestStatus) => {
        dispatch({ type: 'UPDATE_ROSTER_UPDATE_STATUS', payload: { id, status } });
    }

    const pendingLeave = leaveRequests.filter(r => (currentUser?.role === 'Admin' && r.status === 'Pending Admin Approval') || (currentUser?.role === 'HR' && r.status === 'Pending HR Approval'));
    const pendingRosterChanges = rosterChangeRequests.filter(r => (currentUser?.role === 'Admin' && r.status === 'Pending Admin Approval') || (currentUser?.role === 'HR' && r.status === 'Pending HR Approval'));
    const pendingRosterUpdates = rosterUpdateRequests.filter(r => currentUser?.role === 'HR' && r.status === 'Pending HR Approval');
    const pendingExpLetters = experienceLetterRequests.filter(r => (currentUser?.role === 'Admin' || currentUser?.role === 'HR') && r.status === 'Pending');

    return (
        <div className="space-y-8">
            <ApprovalSection title="Leave Requests" requests={pendingLeave}>
                {(req: LeaveRequest) => (
                     <tr key={req.id} className="bg-white border-b"><td className="px-6 py-4 font-medium">{req.userName}</td><td className="px-6 py-4">{`${new Date(req.startDate).toLocaleDateString()}${req.endDate ? ` to ${new Date(req.endDate).toLocaleDateString()}` : ''}`}</td><td className="px-6 py-4">{req.leaveType}</td><td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                        <td className="px-6 py-4"><div className="flex gap-2">
                            <Button className="px-2 py-1 text-xs" onClick={() => handleLeaveUpdate(req.id, req.status)}>{currentUser?.role === 'Admin' ? 'Forward to HR' : 'Approve'}</Button>
                            <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => dispatch({type: 'UPDATE_LEAVE_STATUS', payload: {id: req.id, status: 'Rejected'}})}>Reject</Button>
                        </div></td>
                    </tr>
                )}
            </ApprovalSection>
             <ApprovalSection title="Roster Change Requests" requests={pendingRosterChanges}>
                {(req: RosterChangeRequest) => (
                    <tr key={req.id} className="bg-white border-b"><td className="px-6 py-4 font-medium">{req.userName}</td><td className="px-6 py-4">{new Date(req.date).toLocaleDateString()}</td><td className="px-6 py-4">{req.requestedShift}</td><td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                        <td className="px-6 py-4"><div className="flex gap-2">
                           <Button className="px-2 py-1 text-xs" onClick={() => handleRosterChangeUpdate(req.id, req.status)}>{currentUser?.role === 'Admin' ? 'Forward to HR' : 'Approve'}</Button>
                           <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => dispatch({type: 'UPDATE_ROSTER_CHANGE_STATUS', payload: {id: req.id, status: 'Rejected'}})}>Reject</Button>
                        </div></td>
                    </tr>
                )}
            </ApprovalSection>
            {(currentUser?.role === 'HR' || currentUser?.role === 'Admin') && (
                 <ApprovalSection title="Experience Letter Requests" requests={pendingExpLetters}>
                    {(req: ExperienceLetterRequest) => (
                        <tr key={req.id} className="bg-white border-b"><td className="px-6 py-4 font-medium">{req.userName}</td><td className="px-6 py-4">{new Date(req.requestDate).toLocaleDateString()}</td><td className="px-6 py-4">Experience Letter</td><td className="px-6 py-4">-</td>
                            <td className="px-6 py-4"><div className="flex gap-2">
                                <Button className="px-2 py-1 text-xs" onClick={() => handleExperienceLetterGenerate(req.id)}>Generate Letter</Button>
                            </div></td>
                        </tr>
                    )}
                </ApprovalSection>
            )}
            {currentUser?.role === 'HR' && <ApprovalSection title="Full Roster Updates" requests={pendingRosterUpdates}>
                {(req: RosterUpdateRequest) => (
                    <tr key={req.id} className="bg-white border-b"><td className="px-6 py-4 font-medium">{req.requestedByName}</td><td className="px-6 py-4">{`${new Date(req.periodStartDate).toLocaleDateString()} to ${new Date(req.periodEndDate).toLocaleDateString()}`}</td><td className="px-6 py-4">{`Update for ${req.assignments.length} assignments`}</td><td className="px-6 py-4">{new Date(req.requestDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><div className="flex gap-2">
                           <Button className="px-2 py-1 text-xs" onClick={() => handleRosterUpdateApproval(req.id, 'Approved')}>Approve</Button>
                           <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleRosterUpdateApproval(req.id, 'Rejected')}>Reject</Button>
                        </div></td>
                    </tr>
                )}
            </ApprovalSection>}
        </div>
    );
};

const LeaveManagement: React.FC = () => {
    const { state } = useAppContext();
    const { users, leaveBalances } = state;
    const [searchTerm, setSearchTerm] = useState('');

    const employeeData = useMemo(() => {
        const filteredUsers = users.filter(user => 
            !searchTerm || user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return filteredUsers.map(user => {
            const balance = leaveBalances.find(b => b.userId === user.id);
            return {
                ...user,
                casual: balance?.casual ?? 'N/A',
                sick: balance?.sick ?? 'N/A',
                privileged: balance?.privileged ?? 'N/A',
            };
        }).sort((a,b) => a.name.localeCompare(b.name));
    }, [users, leaveBalances, searchTerm]);

    return (
        <div>
            <div className="flex justify-end mb-4">
                <input 
                    type="text"
                    placeholder="Search Employee..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/3 p-2 border rounded-lg"
                />
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Employee Name</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3 text-center">Casual Leave Balance</th>
                            <th className="px-6 py-3 text-center">Sick Leave Balance</th>
                            <th className="px-6 py-3 text-center">Privileged Leave Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employeeData.map(emp => (
                            <tr key={emp.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{emp.name}</td>
                                <td className="px-6 py-4">{emp.role}</td>
                                <td className="px-6 py-4 text-center font-semibold">{emp.casual}</td>
                                <td className="px-6 py-4 text-center font-semibold">{emp.sick}</td>
                                <td className="px-6 py-4 text-center font-semibold">{emp.privileged}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const getWeekDays = (date: Date): Date[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d; });
};

const RosterManagement = () => {
    const { state, dispatch } = useAppContext();
    const { users, dutyRoster, currentUser } = state;
    const [currentDate, setCurrentDate] = useState(new Date());

    const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
    const rosterableStaff = useMemo(() => users.filter(u => ['Doctor', 'Nurse', 'Receptionist', 'Paramedical'].includes(u.role)), [users]);
    const [localAssignments, setLocalAssignments] = useState<Record<string, Shift>>({});

    useEffect(() => {
        const weekStart = weekDays[0].toISOString().split('T')[0];
        const weekEnd = weekDays[6].toISOString().split('T')[0];
        const initialAssignments: Record<string, Shift> = {};
        dutyRoster
            .filter(a => a.date >= weekStart && a.date <= weekEnd)
            .forEach(a => { initialAssignments[`${a.userId}-${a.date}`] = a.shift; });
        setLocalAssignments(initialAssignments);
    }, [weekDays, dutyRoster]);

    const handleShiftChange = (userId: string, date: string, shift: Shift | 'Off') => {
        const key = `${userId}-${date}`;
        setLocalAssignments(prev => {
            const newAssignments = { ...prev };
            if (shift === 'Off') delete newAssignments[key];
            else newAssignments[key] = shift;
            return newAssignments;
        });
    };

    const handleSubmitRoster = () => {
        if (!currentUser) return;
        const newAssignments: DutyAssignment[] = Object.entries(localAssignments).map(([key, shift]) => {
            const [userId, date] = key.split('-');
            // Corrected type assertion for shift
            return { id: `DA${Date.now()}${Math.random()}`, userId, date, shift: shift as Shift };
        });

        const newRequest: RosterUpdateRequest = {
            id: `RU${Date.now()}`,
            requestedById: currentUser.id,
            requestedByName: currentUser.name,
            requestDate: new Date().toISOString(),
            periodStartDate: weekDays[0].toISOString().split('T')[0],
            periodEndDate: weekDays[6].toISOString().split('T')[0],
            assignments: newAssignments,
            status: 'Pending HR Approval',
        };
        dispatch({ type: 'SUBMIT_ROSTER_UPDATE', payload: newRequest });
        alert('Roster update submitted for approval!');
    };

    const changeWeek = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
            return newDate;
        });
    };

    const shifts: (Shift | 'Off')[] = ['Morning (9AM-5PM)', 'Evening (1PM-9PM)', 'Night (9PM-7AM)', 'Off'];
    const startOfWeek = weekDays[0]; const endOfWeek = weekDays[6];

    return (
        <div>
            <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <Button variant="secondary" onClick={() => changeWeek('prev')}>&larr; Prev Week</Button>
                <h3 className="text-lg font-bold text-primary">{startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
                <Button variant="secondary" onClick={() => changeWeek('next')}>Next Week &rarr;</Button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100"><tr><th className="p-2 sticky left-0 bg-gray-100 z-10">Employee</th>{weekDays.map(d => <th key={d.toISOString()} className="p-2 text-center">{d.toLocaleDateString('en-US', { weekday: 'short' })}<br/>{d.getDate()}</th>)}</tr></thead>
                    <tbody>{rosterableStaff.map(user => (
                        <tr key={user.id} className="border-b"><td className="p-2 font-medium sticky left-0 bg-white">{user.name}</td>
                            {weekDays.map(day => {
                                const dateStr = day.toISOString().split('T')[0];
                                const currentShift = localAssignments[`${user.id}-${dateStr}`] || 'Off';
                                return (<td key={dateStr} className="p-1"><select value={currentShift} onChange={e => handleShiftChange(user.id, dateStr, e.target.value as any)} className="w-full p-1 border rounded bg-white text-xs">
                                    {shifts.map(s => <option key={s} value={s}>{s.split(' ')[0]}</option>)}
                                </select></td>)
                            })}
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            <div className="flex justify-end mt-4"><Button onClick={handleSubmitRoster}>Submit Roster for Approval</Button></div>
        </div>
    );
};

const ApplicantCard: React.FC<{
    applicant: Applicant;
    onSchedule: (applicant: Applicant) => void;
    onFeedback: (applicant: Applicant) => void;
    onOnboard: (applicant: Applicant) => void;
}> = ({ applicant, onSchedule, onFeedback, onOnboard }) => (
    <div className="p-3 mb-3 bg-white rounded-lg shadow border-l-4 border-primary">
        <h4 className="font-bold">{applicant.name}</h4>
        <p className="text-sm text-gray-600">{applicant.positionApplied}</p>
        <p className="text-xs text-gray-400">Applied: {new Date(applicant.applicationDate).toLocaleDateString()}</p>
        {applicant.interviewDetails && <div className="mt-2 text-xs border-t pt-2"><p><strong>Interview:</strong> {new Date(applicant.interviewDetails.date).toLocaleDateString()} at {applicant.interviewDetails.time}</p><p><strong>Interviewer:</strong> {applicant.interviewDetails.interviewerName}</p></div>}
        {applicant.feedback && <div className="mt-2 text-xs border-t pt-2"><p><strong>Feedback:</strong> <span className="italic">{applicant.feedback}</span></p></div>}
        <div className="mt-3 text-right">
            {applicant.status === 'CV Received' && <Button className="text-xs px-2 py-1" onClick={() => onSchedule(applicant)}>Schedule</Button>}
            {applicant.status === 'Interview Scheduled' && <Button className="text-xs px-2 py-1" onClick={() => onFeedback(applicant)}>Add Feedback</Button>}
            {applicant.status === 'Interview Done' && <Button variant="secondary" className="text-xs px-2 py-1" onClick={() => onFeedback(applicant)}>Update Decision</Button>}
            {applicant.status === 'Approved' && <Button className="text-xs px-2 py-1 w-full mt-2" onClick={() => onOnboard(applicant)}>Onboard Employee</Button>}
        </div>
    </div>
);

const Recruitment = () => {
    const { state } = useAppContext();
    const { applicants } = state;
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
    const [applicantToOnboard, setApplicantToOnboard] = useState<Applicant | null>(null);
    
    const handleSchedule = (applicant: Applicant) => { setSelectedApplicant(applicant); setScheduleModalOpen(true); };
    const handleFeedback = (applicant: Applicant) => { setSelectedApplicant(applicant); setFeedbackModalOpen(true); };
    const handleOnboard = (applicant: Applicant) => { setApplicantToOnboard(applicant); };

    const statuses: ApplicantStatus[] = ['CV Received', 'Interview Scheduled', 'Interview Done', 'Approved', 'Onboarded', 'Rejected'];
    const applicantsByStatus = useMemo(() => {
        return statuses.reduce((acc, status) => {
            acc[status] = applicants.filter(app => app.status === status).sort((a,b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime());
            return acc;
        }, {} as Record<ApplicantStatus, Applicant[]>);
    }, [applicants]);

    const statusColors: Record<ApplicantStatus, string> = { 'CV Received': 'bg-blue-100', 'Interview Scheduled': 'bg-yellow-100', 'Interview Done': 'bg-purple-100', 'Approved': 'bg-green-100', 'Rejected': 'bg-red-100', 'Onboarded': 'bg-teal-100' };
    
    return (
        <div>
            <div className="flex justify-end mb-4"><Button onClick={() => setAddModalOpen(true)}>Add New Applicant</Button></div>
            <div className="flex space-x-4 overflow-x-auto pb-4">
                {statuses.map(status => (
                    <div key={status} className={`w-72 p-3 rounded-lg shrink-0 ${statusColors[status]}`}>
                        <h3 className="font-bold text-gray-800 mb-3">{status} ({applicantsByStatus[status].length})</h3>
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">{applicantsByStatus[status].map(app => 
                            <ApplicantCard 
                                key={app.id} 
                                applicant={app}
                                onSchedule={handleSchedule}
                                onFeedback={handleFeedback}
                                onOnboard={handleOnboard}
                             />)}
                        </div>
                    </div>
                ))}
            </div>
            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="Add New Applicant"><AddApplicantForm onClose={() => setAddModalOpen(false)} /></Modal>
            {selectedApplicant && <>
                <Modal isOpen={isScheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title={`Schedule Interview for ${selectedApplicant.name}`}><ScheduleInterviewForm applicant={selectedApplicant} onClose={() => setScheduleModalOpen(false)} /></Modal>
                <Modal isOpen={isFeedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} title={`Feedback for ${selectedApplicant.name}`}><FeedbackForm applicant={selectedApplicant} onClose={() => setFeedbackModalOpen(false)} /></Modal>
            </>}
             {applicantToOnboard && (
                <Modal isOpen={!!applicantToOnboard} onClose={() => setApplicantToOnboard(null)} title={`Onboard ${applicantToOnboard.name}`}>
                    <OnboardingForm applicant={applicantToOnboard} onClose={() => setApplicantToOnboard(null)} />
                </Modal>
            )}
        </div>
    );
};

const PayslipDetailModal: React.FC<{slip: SalarySlip | null, onClose: () => void}> = ({ slip, onClose }) => {
    const { state } = useAppContext();
    if (!slip) return null;

    const user = state.users.find(u => u.id === slip.userId);
    const totalAllowances = slip.allowances.reduce((sum, a) => sum + a.amount, 0);
    const totalDeductions = slip.deductions.reduce((sum, d) => sum + d.amount, 0);
    const grossSalary = slip.basicPay + totalAllowances;
    const monthName = new Date(slip.year, slip.month - 1, 1).toLocaleString('default', { month: 'long' });

    return (
        <Modal isOpen={!!slip} onClose={onClose} title={`Payslip for ${monthName} ${slip.year}`}>
            <div className="font-sans text-sm">
                <div className="text-center mb-4"><h2 className="text-2xl font-bold text-primary">HIMS Professional</h2><p>Payslip for {monthName} {slip.year}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg mb-4"><p><strong>Employee:</strong> {user?.name}</p><p><strong>Employee ID:</strong> {user?.id}</p><p><strong>Role:</strong> {user?.role}</p></div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg"><h4 className="font-bold text-green-800 border-b pb-2 mb-2">Earnings</h4><div className="space-y-1"><div className="flex justify-between"><span>Basic Pay:</span> <span>₹{slip.basicPay.toFixed(2)}</span></div>{slip.allowances.map(a => <div key={a.name} className="flex justify-between"><span>{a.name}:</span> <span>₹{a.amount.toFixed(2)}</span></div>)}</div></div>
                    <div className="bg-red-50 p-4 rounded-lg"><h4 className="font-bold text-red-800 border-b pb-2 mb-2">Deductions</h4><div className="space-y-1">{slip.deductions.map(d => <div key={d.name} className="flex justify-between"><span>{d.name}:</span> <span>- ₹{d.amount.toFixed(2)}</span></div>)}</div></div>
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg"><div className="flex justify-between font-semibold"><p>Gross Salary:</p><p>₹{grossSalary.toFixed(2)}</p></div><div className="flex justify-between font-semibold"><p>Total Deductions:</p><p>- ₹{totalDeductions.toFixed(2)}</p></div><hr className="my-2"/><div className="flex justify-between font-bold text-xl text-primary"><p>Net Salary:</p><p>₹{slip.netSalary.toFixed(2)}</p></div></div>
            </div>
        </Modal>
    );
};

const Payroll = () => {
    const { state, dispatch } = useAppContext();
    const { users, employeeSalaries, salarySlips } = state;
    const [activePayrollTab, setActivePayrollTab] = useState('generate');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [viewingSlip, setViewingSlip] = useState<SalarySlip | null>(null);

    const handleGenerateSlips = () => {
        let generatedCount = 0, existedCount = 0;
        users.forEach(user => {
            const salary = employeeSalaries.find(s => s.userId === user.id);
            if (salary) {
                if (salarySlips.some(s => s.userId === user.id && s.month === selectedMonth && s.year === selectedYear)) {
                    existedCount++;
                } else {
                    const totalAllowances = salary.allowances.reduce((s, a) => s + a.amount, 0);
                    const totalDeductions = salary.deductions.reduce((s, d) => s + d.amount, 0);
                    const newSlip: SalarySlip = { id: `SLIP${Date.now()}${user.id}`, userId: user.id, month: selectedMonth, year: selectedYear, basicPay: salary.basicPay, allowances: salary.allowances, deductions: salary.deductions, netSalary: salary.basicPay + totalAllowances - totalDeductions };
                    dispatch({ type: 'GENERATE_SALARY_SLIP', payload: newSlip });
                    generatedCount++;
                }
            }
        });
        alert(`Generated ${generatedCount} new payslips. ${existedCount} payslips already existed for this period.`);
    };

    const sortedSlips = useMemo(() => [...salarySlips].sort((a,b) => new Date(b.year, b.month - 1).getTime() - new Date(a.year, a.month-1).getTime()), [salarySlips]);

    return (
        <div>
            <div className="flex border-b mb-4">
                <button onClick={() => setActivePayrollTab('generate')} className={`px-4 py-2 font-medium ${activePayrollTab === 'generate' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Generate & History</button>
                <button onClick={() => setActivePayrollTab('structures')} className={`px-4 py-2 font-medium ${activePayrollTab === 'structures' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Salary Structures</button>
            </div>
            {activePayrollTab === 'generate' && (
                <div>
                    <div className="p-4 bg-gray-50 rounded-lg mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                             <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="p-2 border rounded bg-white">{Array.from({length: 12}, (_, i) => <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>)}</select>
                             <input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="p-2 border rounded w-24"/>
                        </div>
                        <Button onClick={handleGenerateSlips}>Generate Payslips for Period</Button>
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-4">Payslip History</h3>
                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm"><thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Employee</th><th className="p-2">Period</th><th className="p-2">Net Salary</th><th className="p-2"></th></tr></thead><tbody>{sortedSlips.map(slip => { const user = users.find(u => u.id === slip.userId); return (<tr key={slip.id} className="border-b"><td className="p-2">{user?.name}</td><td className="p-2">{`${new Date(slip.year, slip.month - 1).toLocaleString('default', { month: 'long' })} ${slip.year}`}</td><td className="p-2 font-semibold">₹{slip.netSalary.toFixed(2)}</td><td className="p-2 text-right"><Button variant="secondary" className="text-xs px-2 py-1" onClick={() => setViewingSlip(slip)}>View</Button></td></tr>)})}</tbody></table>
                    </div>
                </div>
            )}
            {activePayrollTab === 'structures' && (
                <div className="overflow-x-auto max-h-[70vh]">
                    <table className="w-full text-sm"><thead className="bg-gray-100 sticky top-0"><tr><th className="p-2">Employee</th><th className="p-2">Basic Pay</th><th className="p-2">Allowances</th><th className="p-2">Deductions</th><th className="p-2">Net Salary</th></tr></thead><tbody>{users.map(user => { const s = employeeSalaries.find(s => s.userId === user.id); if (!s) return null; const allowances = s.allowances.reduce((sum,a)=>sum+a.amount,0); const deductions = s.deductions.reduce((sum,d)=>sum+d.amount,0); const net = s.basicPay + allowances - deductions; return (<tr key={user.id} className="border-b"><td className="p-2 font-medium">{user.name}</td><td className="p-2">₹{s.basicPay.toFixed(2)}</td><td className="p-2">₹{allowances.toFixed(2)}</td><td className="p-2">₹{deductions.toFixed(2)}</td><td className="p-2 font-bold">₹{net.toFixed(2)}</td></tr>) })}</tbody></table>
                </div>
            )}
            <PayslipDetailModal slip={viewingSlip} onClose={() => setViewingSlip(null)} />
        </div>
    );
};

const Employees: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;
    const isHR = currentUser?.role === 'HR';
    const isAdmin = currentUser?.role === 'Admin';
    const [activeTab, setActiveTab] = useState( (isHR || isAdmin) ? 'roster' : 'myHub' );

    const allTabs: {id: string; label: string; component: React.ReactNode; roles: UserRole[]}[] = [
        { id: 'myHub', label: 'My Hub', component: <MyHub />, roles: ['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Nurse', 'Paramedical', 'Housekeeping', 'Store Incharge', 'HR'] },
        { id: 'myDocuments', label: 'My Documents', component: <MyDocuments />, roles: ['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Nurse', 'Paramedical', 'Housekeeping', 'Store Incharge', 'HR', 'Master IT'] },
        { id: 'approvals', label: 'Approvals', component: <Approvals />, roles: ['Admin', 'HR'] },
        { id: 'leaveManagement', label: 'Leave Management', component: <LeaveManagement />, roles: ['Admin', 'HR'] },
        { id: 'roster', label: 'Roster Management', component: <RosterManagement />, roles: ['Admin', 'HR'] },
        { id: 'recruitment', label: 'Recruitment', component: <Recruitment />, roles: ['HR'] },
        { id: 'payroll', label: 'Payroll', component: <Payroll />, roles: ['Admin', 'HR'] },
    ];
    
    // Filter tabs based on current user's role
    const accessibleTabs = allTabs.filter(tab => currentUser && tab.roles.includes(currentUser.role));

    // Default to the first accessible tab if the current activeTab is not accessible
    useEffect(() => {
        if (!accessibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(accessibleTabs[0]?.id || '');
        }
    }, [currentUser, accessibleTabs, activeTab]);
    
    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="flex border-b mb-6 overflow-x-auto">
                {accessibleTabs.map(tab => (
                     <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`px-4 py-2 font-medium text-lg whitespace-nowrap ${activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
                     >
                        {tab.label}
                     </button>
                ))}
            </div>
            {accessibleTabs.find(tab => tab.id === activeTab)?.component}
        </div>
    );
};

export default Employees;