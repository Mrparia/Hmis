import React from 'react';
import { SalarySlip } from '../types';
import { useAppContext } from '../context/AppContext';

interface PrintableSalarySlipProps {
  slip: SalarySlip;
}

const PrintableSalarySlip: React.FC<PrintableSalarySlipProps> = ({ slip }) => {
  const { state } = useAppContext();
  const user = state.users.find(u => u.id === slip.userId);
  const monthName = new Date(slip.year, slip.month - 1, 1).toLocaleString('default', { month: 'long' });
  const totalAllowances = slip.allowances.reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = slip.deductions.reduce((sum, d) => sum + d.amount, 0);
  const grossSalary = slip.basicPay + totalAllowances;
  
  return (
    <div className="printable-content p-8 font-sans text-sm bg-white">
      <header className="text-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-primary">HIMS Professional</h1>
        <p>123 Health St, Wellness City, 560001</p>
        <h2 className="text-xl font-semibold mt-2">Payslip for {monthName} {slip.year}</h2>
      </header>

      <section className="mb-6 p-4 border rounded-lg bg-gray-50 grid grid-cols-2 gap-4">
        <div>
          <p><strong>Employee Name:</strong> {user?.name}</p>
          <p><strong>Employee ID:</strong> {user?.id}</p>
        </div>
        <div className="text-right">
          <p><strong>Designation:</strong> {user?.role}</p>
          <p><strong>Date of Joining:</strong> {user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A'}</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Earnings</h3>
          <table className="w-full">
            <tbody>
              <tr><td className="py-1">Basic Pay</td><td className="py-1 text-right">₹{slip.basicPay.toFixed(2)}</td></tr>
              {slip.allowances.map(a => (
                <tr key={a.name}><td className="py-1">{a.name}</td><td className="py-1 text-right">₹{a.amount.toFixed(2)}</td></tr>
              ))}
            </tbody>
            <tfoot className="font-bold border-t">
              <tr><td className="py-2">Gross Earnings</td><td className="py-2 text-right">₹{grossSalary.toFixed(2)}</td></tr>
            </tfoot>
          </table>
        </div>
        <div>
          <h3 className="text-lg font-semibold border-b pb-1 mb-2">Deductions</h3>
          <table className="w-full">
            <tbody>
              {slip.deductions.map(d => (
                <tr key={d.name}><td className="py-1">{d.name}</td><td className="py-1 text-right">₹{d.amount.toFixed(2)}</td></tr>
              ))}
            </tbody>
            <tfoot className="font-bold border-t">
              <tr><td className="py-2">Total Deductions</td><td className="py-2 text-right">₹{totalDeductions.toFixed(2)}</td></tr>
            </tfoot>
          </table>
        </div>
      </section>

      <footer className="mt-8 pt-4 border-t-2 text-center">
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-lg">
          <p className="text-lg font-bold">Net Salary</p>
          <p className="text-2xl font-bold text-primary">₹{slip.netSalary.toFixed(2)}</p>
        </div>
        <p className="text-xs text-gray-500 mt-4">This is a computer-generated document and does not require a signature.</p>
      </footer>
    </div>
  );
};
export default PrintableSalarySlip;
