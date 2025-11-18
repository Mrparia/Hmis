import React from 'react';
import { User } from '../types';

interface PrintableExperienceLetterProps {
  user: User;
}

const PrintableExperienceLetter: React.FC<PrintableExperienceLetterProps> = ({ user }) => {
  const joiningDate = user.joiningDate ? new Date(user.joiningDate) : new Date();
  const today = new Date();

  return (
    <div className="printable-content p-12 font-serif text-base bg-white leading-relaxed">
      <header className="text-center mb-12">
        <h1 className="text-3xl font-bold text-primary">HIMS Professional</h1>
        <p>123 Health St, Wellness City, 560001</p>
      </header>

      <p className="text-right mb-10">Date: {today.toLocaleDateString('en-GB')}</p>
      
      <h2 className="text-2xl font-bold text-center mb-8">TO WHOM IT MAY CONCERN</h2>
      <h3 className="text-xl font-bold text-center mb-8">Experience Certificate</h3>

      <p className="mb-6">
        This is to certify that <strong>{user.name}</strong> (Employee ID: {user.id}) was employed with HIMS Professional.
      </p>
      <p className="mb-6">
        During their tenure with us from <strong>{joiningDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> to <strong>{today.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, 
        they held the position of <strong>{user.role}</strong>.
      </p>
      <p className="mb-6">
        Throughout their employment, we found them to be diligent, responsible, and a valuable member of our team. 
        Their contributions to the {user.role} department were significant.
      </p>
      <p className="mb-8">
        We wish them all the best in their future endeavors.
      </p>

      <div className="mt-24">
        <p>Sincerely,</p>
        <p className="mt-16">_________________________</p>
        <p><strong>Holly HR</strong></p>
        <p>Head of Human Resources</p>
        <p>HIMS Professional</p>
      </div>
    </div>
  );
};
export default PrintableExperienceLetter;
