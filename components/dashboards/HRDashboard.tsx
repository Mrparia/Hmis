import React, { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAppContext } from '../../context/AppContext';
import Card from '../common/Card';
import Modal from '../common/Modal';
import { ApplicantStatus } from '../../types';

const HRDashboard: React.FC = () => {
    const { state } = useAppContext();
    const { users, attendanceRecords, leaveRequests, employeeSalaries, applicants } = state;
    const [activeTab, setActiveTab] = useState<'overview' | 'appraisal'>('overview');
    const [pipelineModal, setPipelineModal] = useState<{isOpen: boolean, status: ApplicantStatus | null}>({isOpen: false, status: null});

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const newEmployeesCount = 2; // Static for now
    const todaysBirthdaysCount = users.filter(user => {
        if (!user.dateOfBirth) return false;
        const dob = new Date(user.dateOfBirth);
        return dob.getMonth() + 1 === todayMonth && dob.getDate() === todayDay;
    }).length;

    const presentEmployeesCount = attendanceRecords.filter(r => r.date === todayStr && r.status === 'Present').length;
    
    const employeesOnLeaveCount = leaveRequests.filter(req => {
        if (req.status !== 'Approved') return false;
        const startDate = new Date(req.startDate);
        const endDate = new Date(req.endDate);
        startDate.setHours(0,0,0,0);
        endDate.setHours(0,0,0,0);
        return startDate <= today && today <= endDate;
    }).length;

    const budgetData = useMemo(() => {
        const actualSpend = employeeSalaries.reduce((total, salary) => {
            const totalAllowances = salary.allowances.reduce((sum, a) => sum + a.amount, 0);
            return total + salary.basicPay + totalAllowances;
        }, 0);
        return [{ name: 'Monthly Salary Budget', Allocated: 500000, Spent: actualSpend }];
    }, [employeeSalaries]);

    const recruitmentData = useMemo(() => ({
        'CV Received': applicants.filter(a => a.status === 'CV Received').length,
        'Interview Scheduled': applicants.filter(a => a.status === 'Interview Scheduled').length,
        'Interview Done': applicants.filter(a => a.status === 'Interview Done').length,
        'Rejected': applicants.filter(a => a.status === 'Rejected').length,
        'Approved': applicants.filter(a => a.status === 'Approved').length,
    }), [applicants]);

    const openPipelineModal = (status: ApplicantStatus) => {
        setPipelineModal({ isOpen: true, status });
    };

    const eligibleForAppraisal = useMemo(() => {
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        return users.filter(user => user.joiningDate && new Date(user.joiningDate) <= oneYearAgo)
            .map(user => {
                const joiningDate = new Date(user.joiningDate!);
                const daysSinceJoining = Math.floor((today.getTime() - joiningDate.getTime()) / (1000 * 3600 * 24));
                const salaryInfo = employeeSalaries.find(s => s.userId === user.id);
                return {
                    user,
                    joiningDate,
                    daysSinceJoining,
                    salaryInfo,
                };
            })
            .sort((a,b) => b.daysSinceJoining - a.daysSinceJoining);
    }, [users, employeeSalaries, today]);

    return (
        <div className="space-y-8">
             <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                    Dashboard Overview
                </button>
                <button onClick={() => setActiveTab('appraisal')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'appraisal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>
                    Employees Eligible for Appraisal
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card title="New Employees (Month)" value={newEmployeesCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} color="primary" />
                        <Card title="Today's Birthdays" value={todaysBirthdaysCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454A3.454 3.454 0 00 3 19v-1.546l.043-.021A3.454 3.454 0 00 3 15.546zM21 8.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0c-.454-.303-.977-.454-1.5-.454A3.454 3.454 0 00 3 12v-1.546l.043-.021A3.454 3.454 0 00 3 8.546z" /></svg>} color="accent" />
                        <Card title="Present Employees" value={presentEmployeesCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.282-.237-1.887M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.084-1.282-.237-1.887M12 15a4 4 0 100-8 4 4 0 000 8z" /></svg>} color="green" />
                        <Card title="Employees on Leave" value={employeesOnLeaveCount} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8a1 1 0 001-1zM3 10h10M3 13h4" /></svg>} color="yellow" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-surface rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">Employee Budget</h3>
                             <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={budgetData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" hide />
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="Allocated" fill="#8884d8" name="Total Budget" />
                                    <Bar dataKey="Spent" fill="#82ca9d" name="Actual Spend" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-surface rounded-xl shadow-lg p-6">
                            <h3 className="text-xl font-bold text-primary mb-4">Recruitment Pipeline</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div onClick={() => openPipelineModal('CV Received')} className="bg-blue-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"><p className="text-sm font-medium text-blue-700">New CVs Received</p><p className="text-2xl font-bold text-blue-900">{recruitmentData['CV Received']}</p></div>
                                <div onClick={() => openPipelineModal('Interview Scheduled')} className="bg-indigo-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"><p className="text-sm font-medium text-indigo-700">Interviews Scheduled</p><p className="text-2xl font-bold text-indigo-900">{recruitmentData['Interview Scheduled']}</p></div>
                                <div onClick={() => openPipelineModal('Interview Done')} className="bg-purple-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"><p className="text-sm font-medium text-purple-700">Interviews Done</p><p className="text-2xl font-bold text-purple-900">{recruitmentData['Interview Done']}</p></div>
                                <div onClick={() => openPipelineModal('Rejected')} className="bg-red-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition-shadow"><p className="text-sm font-medium text-red-700">Rejected Applicants</p><p className="text-2xl font-bold text-red-900">{recruitmentData['Rejected']}</p></div>
                                <div onClick={() => openPipelineModal('Approved')} className="bg-green-50 p-4 rounded-lg col-span-2 text-center cursor-pointer hover:shadow-md transition-shadow"><p className="text-sm font-medium text-green-700">Approved Applicants</p><p className="text-3xl font-bold text-green-900">{recruitmentData['Approved']}</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'appraisal' && (
                <div className="bg-surface rounded-xl shadow-lg p-6">
                     <h3 className="text-xl font-bold text-primary mb-4">Employees Eligible for Appraisal ({eligibleForAppraisal.length})</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Employee Name</th>
                                    <th className="px-6 py-3">Designation</th>
                                    <th className="px-6 py-3">Date of Joining</th>
                                    <th className="px-6 py-3">Days with Org.</th>
                                    <th className="px-6 py-3 text-right">Current Basic Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {eligibleForAppraisal.map(({user, joiningDate, daysSinceJoining, salaryInfo}) => (
                                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4">{user.role}</td>
                                        <td className="px-6 py-4">{joiningDate.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-semibold">{daysSinceJoining}</td>
                                        <td className="px-6 py-4 text-right">₹{salaryInfo?.basicPay.toLocaleString() || 'N/A'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            )}

            <Modal isOpen={pipelineModal.isOpen} onClose={() => setPipelineModal({isOpen: false, status: null})} title={`Applicants: ${pipelineModal.status || ''}`}>
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-2">Name</th>
                                <th className="p-2">Position</th>
                                <th className="p-2">Application Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.filter(a => a.status === pipelineModal.status).map(app => (
                                <tr key={app.id} className="border-b">
                                    <td className="p-2 font-medium">{app.name}</td>
                                    <td className="p-2">{app.positionApplied}</td>
                                    <td className="p-2">{new Date(app.applicationDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
        </div>
    );
};
export default HRDashboard;