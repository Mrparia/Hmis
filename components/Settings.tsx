import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, UserRole, EmployeeSalary, InventoryItem } from '../types';
import Button from './common/Button';
import Modal from './common/Modal';

type SettingsTab = 'users' | 'services';

const UserForm: React.FC<{onClose: () => void}> = ({ onClose }) => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('Nurse');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [basicPay, setBasicPay] = useState(0);
    const [allowances, setAllowances] = useState([{ name: 'HRA', amount: '' }, { name: 'Travel', amount: '' }]);
    const [deductions, setDeductions] = useState([{ name: 'Provident Fund', amount: '' }, { name: 'Tax', amount: '' }]);
    
    const userRoles: UserRole[] = ['Admin', 'Doctor', 'Receptionist', 'Pharmacist', 'Nurse', 'Paramedical', 'Housekeeping', 'Store Incharge', 'HR'];

    const handleAllowanceChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const values = [...allowances];
        values[index][event.target.name as 'name' | 'amount'] = event.target.value;
        setAllowances(values);
    };
    
    const handleDeductionChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const values = [...deductions];
        values[index][event.target.name as 'name' | 'amount'] = event.target.value;
        setDeductions(values);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newUserId = `U${Date.now()}`;
        const newUser: User = { id: newUserId, name, role, username, password };
        const newSalary: EmployeeSalary = {
            userId: newUserId,
            basicPay: Number(basicPay),
            allowances: allowances.filter(a => a.name && a.amount).map(a => ({...a, amount: Number(a.amount)})),
            deductions: deductions.filter(d => d.name && d.amount).map(d => ({...d, amount: Number(d.amount)}))
        };
        dispatch({type: 'ADD_EMPLOYEE', payload: { newUser, newSalary }});
        if (role === 'Doctor') {
            dispatch({type: 'ADD_DOCTOR', payload: { id: newUserId, name: `Dr. ${name}`, qualification: 'MBBS', specialization: 'General' }});
        }
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Employee Details</legend>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full px-3 py-2 border rounded-md"/>
                <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full px-3 py-2 border bg-white rounded-md">
                    {userRoles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required className="w-full px-3 py-2 border rounded-md"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-3 py-2 border rounded-md"/>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="px-2 font-semibold">Salary Structure</legend>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Basic Pay</label>
                    <input type="number" value={basicPay} onChange={e => setBasicPay(Number(e.target.value))} required className="mt-1 w-full px-3 py-2 border rounded-md"/>
                </div>
                <div>
                    <h4 className="font-medium text-gray-700 mb-2">Allowances</h4>
                    {allowances.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                           <input name="name" value={item.name} onChange={e => handleAllowanceChange(index, e)} placeholder="Allowance Name" className="w-full px-3 py-2 border rounded-md"/>
                           <input name="amount" type="number" value={item.amount} onChange={e => handleAllowanceChange(index, e)} placeholder="Amount" className="w-full px-3 py-2 border rounded-md"/>
                        </div>
                    ))}
                </div>
                 <div className="mt-4">
                    <h4 className="font-medium text-gray-700 mb-2">Deductions</h4>
                    {deductions.map((item, index) => (
                         <div key={index} className="flex items-center gap-2 mb-2">
                           <input name="name" value={item.name} onChange={e => handleDeductionChange(index, e)} placeholder="Deduction Name" className="w-full px-3 py-2 border rounded-md"/>
                           <input name="amount" type="number" value={item.amount} onChange={e => handleDeductionChange(index, e)} placeholder="Amount" className="w-full px-3 py-2 border rounded-md"/>
                        </div>
                    ))}
                </div>
            </fieldset>

            <div className="flex justify-end pt-4">
                <Button type="submit">Create Employee</Button>
            </div>
        </form>
    );
};

const ServiceForm: React.FC<{ service?: InventoryItem; onClose: () => void }> = ({ service, onClose }) => {
    const { dispatch } = useAppContext();
    const [name, setName] = useState(service?.name || '');
    const [category, setCategory] = useState<'General' | 'Pathology' | 'Radiology'>(service?.category as any || 'General');
    const [price, setPrice] = useState(service?.price || 0);
    const [gstRate, setGstRate] = useState<0 | 5 | 12 | 18 | 28>(service?.gstRate || 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (service) { // Editing existing service
            const updatedService: InventoryItem = {
                ...service, name, price, gstRate
            };
            dispatch({ type: 'UPDATE_SERVICE', payload: updatedService });
        } else { // Creating new service
            const newService: InventoryItem = {
                id: `${category.substring(0,3).toUpperCase()}${Date.now()}`,
                name, category, price, gstRate, reorderLevel: 0,
                batches: [{ batchNumber: 'NA', stock: 99999, expiryDate: new Date('2999-12-31').toISOString(), costPrice: 0 }]
            };
            dispatch({ type: 'ADD_SERVICE', payload: newService });
        }
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Service Name" required className="w-full px-3 py-2 border rounded-md" />
            <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full px-3 py-2 border bg-white rounded-md">
                <option value="General">General</option>
                <option value="Pathology">Pathology</option>
                <option value="Radiology">Radiology</option>
            </select>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} placeholder="Price" required min="0" className="w-full px-3 py-2 border rounded-md" />
            <select value={gstRate} onChange={e => setGstRate(Number(e.target.value) as any)} className="w-full px-3 py-2 border bg-white rounded-md">
                <option value={0}>GST 0%</option>
                <option value={5}>GST 5%</option>
                <option value={12}>GST 12%</option>
                <option value={18}>GST 18%</option>
                <option value={28}>GST 28%</option>
            </select>
            <div className="flex justify-end pt-4"><Button type="submit">{service ? 'Update Service' : 'Add Service'}</Button></div>
        </form>
    );
};

const Settings: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { currentUser } = state;
    const [activeTab, setActiveTab] = useState<SettingsTab>('users');
    const [isUserModalOpen, setUserModalOpen] = useState(false);
    const [isServiceModalOpen, setServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<InventoryItem | undefined>(undefined);

    const canManageServices = currentUser?.role === 'Master IT';

    useEffect(() => {
        if (!canManageServices && activeTab === 'services') {
            setActiveTab('users');
        }
    }, [canManageServices, activeTab]);

    const handleDeleteUser = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            dispatch({ type: 'DELETE_USER', payload: { userId } });
        }
    };
    
    const handleEditService = (service: InventoryItem) => {
        setEditingService(service);
        setServiceModalOpen(true);
    };

    const handleAddService = () => {
        setEditingService(undefined);
        setServiceModalOpen(true);
    };
    
    const services = useMemo(() => state.inventory.filter(item => 
        ['General', 'Pathology', 'Radiology'].includes(item.category)
    ), [state.inventory]);

    return (
        <div className="bg-surface p-6 rounded-xl shadow-lg">
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>User Management</button>
                {canManageServices && (
                    <button onClick={() => setActiveTab('services')} className={`px-4 py-2 font-medium text-lg ${activeTab === 'services' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>Service & Charge Management</button>
                )}
            </div>

            {activeTab === 'users' && (
                <div>
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setUserModalOpen(true)}>Add Employee</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">User ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Role</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.users.map(user => (
                                    <tr key={user.id} className="bg-white border-b">
                                        <td className="px-6 py-4">{user.id}</td>
                                        <td className="px-6 py-4 font-medium">{user.name}</td>
                                        <td className="px-6 py-4">{user.role}</td>
                                        <td className="px-6 py-4">
                                            {user.id !== currentUser?.id ? (
                                                <Button variant="danger" className="px-2 py-1 text-xs" onClick={() => handleDeleteUser(user.id)}>Delete</Button>
                                            ) : <span className="text-xs text-gray-400">Cannot Delete Self</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            {activeTab === 'services' && canManageServices && (
                <div>
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleAddService}>Add Service</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">Service ID</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Category</th>
                                    <th className="px-6 py-3">Price</th>
                                    <th className="px-6 py-3">GST Rate</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <tr key={service.id} className="bg-white border-b">
                                        <td className="px-6 py-4">{service.id}</td>
                                        <td className="px-6 py-4 font-medium">{service.name}</td>
                                        <td className="px-6 py-4">{service.category}</td>
                                        <td className="px-6 py-4">₹{service.price.toFixed(2)}</td>
                                        <td className="px-6 py-4">{service.gstRate}%</td>
                                        <td className="px-6 py-4">
                                            <Button variant="secondary" className="px-2 py-1 text-xs" onClick={() => handleEditService(service)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isUserModalOpen} onClose={() => setUserModalOpen(false)} title="Create New Employee">
                <UserForm onClose={() => setUserModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isServiceModalOpen} onClose={() => setServiceModalOpen(false)} title={editingService ? 'Edit Service' : 'Add New Service'}>
                <ServiceForm service={editingService} onClose={() => setServiceModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default Settings;