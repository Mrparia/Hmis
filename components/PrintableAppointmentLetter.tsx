import React from 'react';
import { User, EmployeeSalary } from '../types';

interface PrintableAppointmentLetterProps {
  user: User;
  salary: EmployeeSalary;
}

const PrintableAppointmentLetter: React.FC<PrintableAppointmentLetterProps> = ({ user, salary }) => {
  const joiningDate = user.joiningDate ? new Date(user.joiningDate) : new Date();
  const totalAllowances = salary.allowances.reduce((sum, a) => sum + a.amount, 0);
  const grossMonthly = salary.basicPay + totalAllowances;

  return (
    <div className="printable-content p-12 font-serif text-base bg-white leading-relaxed">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary">HIMS Professional</h1>
        <p>123 Health St, Wellness City, 560001</p>
      </header>

      <p className="text-right mb-8">Date: {new Date().toLocaleDateString('en-GB')}</p>

      <div className="mb-6">
        <p>{user.name}</p>
        <p>[Employee Address Placeholder]</p>
      </div>

      <h2 className="text-xl font-bold mb-4">Subject: Letter of Appointment</h2>

      <p className="mb-4">Dear {user.name},</p>
      <p className="mb-4">
        We are pleased to offer you the position of <strong>{user.role}</strong> at HIMS Professional. 
        We trust that your knowledge, skills, and experience will be a valuable asset to our organization.
      </p>
      <p className="mb-4">
        Your employment will commence on <strong>{joiningDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>. 
        You will be based at our main facility in Wellness City.
      </p>

      <h3 className="text-lg font-bold mt-6 mb-2">Compensation:</h3>
      <p className="mb-4">Your salary structure will be as follows:</p>
      <ul className="list-disc pl-8 mb-4">
        <li><strong>Basic Pay:</strong> ₹{salary.basicPay.toLocaleString()} per month</li>
        {salary.allowances.map(a => (
            <li key={a.name}><strong>{a.name}:</strong> ₹{a.amount.toLocaleString()} per month</li>
        ))}
        <li><strong>Gross Monthly Salary:</strong> ₹{grossMonthly.toLocaleString()} per month</li>
      </ul>
      <p className="mb-4">
        Your salary will be subject to statutory deductions such as Provident Fund and Income Tax as per prevailing laws.
      </p>

      <p className="mb-6">
        We look forward to a long and successful association with you. Please sign and return a duplicate copy of this letter in acceptance of the terms and conditions.
      </p>

      <div className="mt-20">
        <p>Yours sincerely,</p>
        <p className="mt-12">_________________________</p>
        <p><strong>Holly HR</strong></p>
        <p>Head of Human Resources</p>
        <p>HIMS Professional</p>
      </div>
    </div>
  );
};
export default PrintableAppointmentLetter;
