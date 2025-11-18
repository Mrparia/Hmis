import { Patient, InventoryItem, Bill, PurchaseOrder, GoodsReceiptNote, Doctor, Prescription, User, DutyAssignment, LeaveRequest, AttendanceRecord, SalarySlip, Vendor, EmployeeSalary, Applicant, AuditLog, Holiday, RosterChangeRequest, PatientVisit, Surgery, RosterUpdateRequest, AppointmentRequest, LabRequest, SalesReturn, EmployeeLeaveBalance, LeaveType, RequisitionRequest, ExperienceLetterRequest } from './types';

const todayForBirthday = new Date();
const todayMonth = String(todayForBirthday.getMonth() + 1).padStart(2, '0');
const todayDate = String(todayForBirthday.getDate()).padStart(2, '0');


export const MOCK_USERS: User[] = [
  { id: 'U001', username: 'admin', password: 'password', name: 'Admin User', role: 'Admin', dateOfBirth: '1980-01-01', joiningDate: '2020-01-15T10:00:00Z' },
  { id: 'U002', username: 'doctor', password: 'password', name: 'Dr. Ben Joshi', role: 'Doctor', dateOfBirth: '1985-07-15', joiningDate: '2022-07-20T10:00:00Z' },
  { id: 'U003', username: 'reception', password: 'password', name: 'Sarah Connor', role: 'Receptionist', dateOfBirth: `1990-${todayMonth}-${todayDate}`, joiningDate: '2023-03-10T10:00:00Z' },
  { id: 'U004', username: 'pharma', password: 'password', name: 'Mike Pharmacist', role: 'Pharmacist', dateOfBirth: '1988-11-20', joiningDate: '2021-06-01T10:00:00Z' },
  { id: 'U005', username: 'nurse', password: 'password', name: 'Nancy Nurse', role: 'Nurse', dateOfBirth: '1992-03-30', joiningDate: '2024-02-12T10:00:00Z' },
  { id: 'U006', username: 'para', password: 'password', name: 'Peter Paramedic', role: 'Paramedical', joiningDate: '2023-08-01T10:00:00Z' },
  { id: 'U007', username: 'house', password: 'password', name: 'Helen Housekeeper', role: 'Housekeeping', joiningDate: '2022-11-05T10:00:00Z' },
  { id: 'U008', username: 'store', password: 'password', name: 'Steve Storeman', role: 'Store Incharge', joiningDate: '2020-09-15T10:00:00Z' },
  { id: 'U009', username: 'hr', password: 'password', name: 'Holly HR', role: 'HR', dateOfBirth: '1982-05-10', joiningDate: '2019-04-01T10:00:00Z' },
  // Align existing doctors with user accounts for dashboard functionality
  { id: 'D001', username: 'carter', password: 'password', name: 'Dr. Emily Carter', role: 'Doctor', dateOfBirth: '1981-04-12', joiningDate: '2018-10-22T10:00:00Z' },
  { id: 'D003', username: 'sharma', password: 'password', name: 'Dr. Priya Sharma', role: 'Doctor', dateOfBirth: '1988-09-21', joiningDate: '2021-12-01T10:00:00Z' },
  // Add 6 new doctors
  { id: 'D004', username: 'doctor1', password: 'password', name: 'Dr. Alex Ray', role: 'Doctor', dateOfBirth: '1990-01-15', joiningDate: '2023-11-15T10:00:00Z' },
  { id: 'D005', username: 'doctor2', password: 'password', name: 'Dr. Sarah Chen', role: 'Doctor', dateOfBirth: '1987-03-22', joiningDate: '2024-01-20T10:00:00Z' },
  { id: 'D006', username: 'doctor3', password: 'password', name: 'Dr. Michael Lee', role: 'Doctor', dateOfBirth: '1982-11-30', joiningDate: '2023-05-18T10:00:00Z' },
  { id: 'D007', username: 'doctor4', password: 'password', name: 'Dr. Jessica Woo', role: 'Doctor', dateOfBirth: '1991-07-19', joiningDate: '2022-02-28T10:00:00Z' },
  { id: 'D008', username: 'doctor5', password: 'password', name: 'Dr. David Kim', role: 'Doctor', dateOfBirth: '1984-05-25', joiningDate: '2023-09-11T10:00:00Z' },
  { id: 'D009', username: 'doctor6', password: 'password', name: 'Dr. Olivia Martinez', role: 'Doctor', dateOfBirth: '1989-08-08', joiningDate: '2024-03-01T10:00:00Z' },
  // Master IT User
  { id: 'U999', username: 'masterit', password: 'password', name: 'Master IT Admin', role: 'Master IT', joiningDate: '2018-01-01T10:00:00Z' },
];

export const MOCK_LEAVE_BALANCES: EmployeeLeaveBalance[] = MOCK_USERS.map(user => ({
    userId: user.id,
    casual: 12,
    sick: 6,
    privileged: 15,
}));

export const MOCK_DOCTORS: Doctor[] = [
    { 
        id: 'D001', 
        name: 'Dr. Emily Carter', 
        qualification: 'MD, MBBS', 
        specialization: 'Cardiology', 
        registrationNumber: 'IMC12345', 
        signatureUrl: 'https://via.placeholder.com/150x50/000000/FFFFFF/?text=E.+Carter+MD',
        availability: {
            "Monday": ["09:00-13:00", "14:00-17:00"],
            "Wednesday": ["09:00-13:00"],
            "Friday": ["09:00-13:00", "14:00-17:00"],
        }
    },
    { 
        id: 'U002', 
        name: 'Dr. Ben Joshi', 
        qualification: 'MS', 
        specialization: 'Orthopedics', 
        registrationNumber: 'IMC67890', 
        signatureUrl: 'https://via.placeholder.com/150x50/000000/FFFFFF/?text=Ben+Joshi+MS',
        availability: {
            "Tuesday": ["10:00-14:00"],
            "Thursday": ["10:00-14:00", "15:00-18:00"],
        }
    },
    { 
        id: 'D003', 
        name: 'Dr. Priya Sharma', 
        qualification: 'DM, MBBS', 
        specialization: 'Neurology', 
        registrationNumber: 'IMC54321', 
        signatureUrl: 'https://via.placeholder.com/150x50/000000/FFFFFF/?text=Priya+Sharma+DM',
        availability: {
            "Monday": ["14:00-18:00"],
            "Tuesday": ["14:00-18:00"],
            "Wednesday": ["14:00-18:00"],
            "Thursday": ["14:00-18:00"],
            "Friday": ["14:00-18:00"],
        }
    },
    // Add 6 new doctors
    { id: 'D004', name: 'Dr. Alex Ray', qualification: 'MD', specialization: 'Pediatrics', registrationNumber: 'IMC11223' },
    { id: 'D005', name: 'Dr. Sarah Chen', qualification: 'MS', specialization: 'General Surgery', registrationNumber: 'IMC44556' },
    { id: 'D006', name: 'Dr. Michael Lee', qualification: 'MD', specialization: 'Dermatology', registrationNumber: 'IMC77889' },
    { id: 'D007', name: 'Dr. Jessica Woo', qualification: 'MBBS', specialization: 'Ophthalmology', registrationNumber: 'IMC99887' },
    { id: 'D008', name: 'Dr. David Kim', qualification: 'MS', specialization: 'ENT', registrationNumber: 'IMC66554' },
    { id: 'D009', name: 'Dr. Olivia Martinez', qualification: 'MD', specialization: 'Gastroenterology', registrationNumber: 'IMC33221' },
];

export const MOCK_VENDORS: Vendor[] = [
  { id: 'V001', name: 'Pharma Solutions Inc.', gstNumber: '29ABCDE1234F1Z5', drugLicenseNumber: 'DL12345', contactPerson: 'Mr. John Smith', phone: '9876543210', address: '123 Pharma Lane, Bangalore' },
  { id: 'V002', name: 'MedSupply Co.', gstNumber: '27FGHIJ6789K1Z4', drugLicenseNumber: 'DL67890', contactPerson: 'Ms. Priya Patel', phone: '8765432109', address: '456 Supply Road, Mumbai' },
  { id: 'V003', name: 'General Hospital Supplies', gstNumber: '36LMNOP1234Q1Z3', contactPerson: 'Mr. Anil Kumar', phone: '7654321098', address: '789 General St, Hyderabad' },
];

export const MOCK_WARDS_BEDS = {
    'General Ward': Array.from({length: 20}, (_, i) => `GEN-${101 + i}`),
    'ICU': Array.from({length: 10}, (_, i) => `ICU-${201 + i}`),
    'Maternity Ward': Array.from({length: 15}, (_, i) => `MAT-${301 + i}`),
};

export const MOCK_PATIENTS: Patient[] = [
  { 
    id: 'P1720633201', 
    name: 'John Doe', 
    age: 45, 
    gender: 'Male', 
    contact: 'john.doe@email.com', 
    registeredDate: new Date('2024-10-26T10:00:00Z').toISOString(),
    address: '123 Health St, Wellness City',
    pincode: '560001',
    city: 'Bengaluru',
    state: 'Karnataka',
    patientType: 'IPD',
    assignedDoctorId: 'D001',
    bedInfo: { ward: 'General Ward', bedNumber: 'GEN-101' },
    medicalHistory: {
        drugAllergies: 'Penicillin',
        pastSurgeries: 'Appendectomy (2010)',
    }
  },
  { 
    id: 'P1720633202', 
    name: 'Jane Smith', 
    age: 34, 
    gender: 'Female', 
    contact: 'jane.smith@email.com', 
    registeredDate: new Date('2024-10-25T14:30:00Z').toISOString(),
    address: '456 Cure Avenue',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    patientType: 'OPD',
    assignedDoctorId: 'U002',
     medicalHistory: {
        thyroidHistory: 'Hypothyroidism, on medication',
        familyMedicalHistory: 'Father has Type 2 Diabetes',
    }
  },
  { 
    id: 'P1720633203', 
    name: 'Peter Jones', 
    age: 28, 
    gender: 'Male', 
    contact: 'peter.jones@email.com', 
    registeredDate: new Date().toISOString(), // Registered today
    address: '789 Recovery Lane',
    pincode: '110001',
    city: 'New Delhi',
    state: 'Delhi',
    patientType: 'OPD',
    assignedDoctorId: 'U002'
  },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { 
    id: 'MED001', name: 'Paracetamol 500mg', category: 'Medicine', reorderLevel: 50, price: 2.5, gstRate: 5, 
    batches: [
      { batchNumber: 'PCTM-101', stock: 150, expiryDate: new Date('2026-12-31T23:59:59Z').toISOString(), costPrice: 1.8 },
      { batchNumber: 'PCTM-102', stock: 100, expiryDate: new Date('2027-06-30T23:59:59Z').toISOString(), costPrice: 1.9 },
    ]
  },
  { 
    id: 'MED002', name: 'Amoxicillin 250mg', category: 'Medicine', reorderLevel: 30, price: 15, gstRate: 12,
    batches: [
      { batchNumber: 'AMX-201', stock: 150, expiryDate: new Date('2025-10-31T23:59:59Z').toISOString(), costPrice: 12.5 }
    ]
  },
  { 
    id: 'MED003', name: 'Atorvastatin 20mg', category: 'Medicine', reorderLevel: 50, price: 8, gstRate: 12,
    batches: [
      { batchNumber: 'ATV-301', stock: 300, expiryDate: new Date('2026-08-31T23:59:59Z').toISOString(), costPrice: 6.0 }
    ]
  },
  { 
    id: 'CON001', name: 'Syringes 10ml', category: 'Consumable', reorderLevel: 100, price: 5, gstRate: 12,
    batches: [
       { batchNumber: 'SYR-A1', stock: 500, expiryDate: new Date('2028-01-01T23:59:59Z').toISOString(), costPrice: 3.5 }
    ]
  },
  { 
    id: 'CON002', name: 'Gauze Pads', category: 'Consumable', reorderLevel: 200, price: 1.2, gstRate: 5,
    batches: [
      { batchNumber: 'GP-B1', stock: 1200, expiryDate: new Date('2029-01-01T23:59:59Z').toISOString(), costPrice: 0.8 }
    ]
  },
  { 
    id: 'GEN001', name: 'Consultation Fee', category: 'General', reorderLevel: 0, price: 500, gstRate: 18,
    batches: [
      { batchNumber: 'NA', stock: 9999, expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), costPrice: 0 }
    ]
  },
  { 
    id: 'PAT001', name: 'Complete Blood Count (CBC)', category: 'Pathology', reorderLevel: 0, price: 800, gstRate: 0,
    batches: [
      { batchNumber: 'NA', stock: 9999, expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), costPrice: 0 }
    ]
  },
   { 
    id: 'RAD001', name: 'X-Ray Chest', category: 'Radiology', reorderLevel: 0, price: 1200, gstRate: 0,
    batches: [
      { batchNumber: 'NA', stock: 9999, expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), costPrice: 0 }
    ]
  },
];

const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);

export const MOCK_BILLS: Bill[] = [
  {
    id: 'B1720633301',
    patientId: 'P1720633201',
    patientName: 'John Doe',
    customerType: 'Registered',
    billDate: today.toISOString(),
    items: [
      { itemId: 'MED001', itemName: 'Paracetamol 500mg', quantity: 20, pricePerUnit: 2.5, gstRate: 5, total: 50, gstAmount: 2.5, batchNumber: 'PCTM-101', expiryDate: new Date('2026-12-31T23:59:59Z').toISOString(), discountPercentage: 0, discountAmount: 0, category: 'Medicine' },
      { itemId: 'GEN001', itemName: 'Consultation Fee', quantity: 1, pricePerUnit: 500, gstRate: 18, total: 500, gstAmount: 90, batchNumber: 'NA', expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), discountPercentage: 0, discountAmount: 0, category: 'General' },
    ],
    subTotal: 550,
    totalDiscount: 0,
    totalGst: 92.5,
    grandTotal: 642.5,
    paymentMethod: 'Card',
    billType: 'Pharmacy',
    status: 'Finalized',
    requestedById: 'U004',
  },
  {
    id: 'B1720633302',
    patientId: 'P1720633202',
    patientName: 'Jane Smith',
    customerType: 'Registered',
    billDate: yesterday.toISOString(),
    items: [
      { itemId: 'PAT001', itemName: 'Complete Blood Count (CBC)', quantity: 1, pricePerUnit: 800, gstRate: 0, total: 800, gstAmount: 0, batchNumber: 'NA', expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), discountPercentage: 0, discountAmount: 0, category: 'Pathology' },
    ],
    subTotal: 800,
    totalDiscount: 0,
    totalGst: 0,
    grandTotal: 800,
    paymentMethod: 'Cash',
    billType: 'Services',
    status: 'Finalized',
    requestedById: 'U003',
  },
  {
    id: 'B1720633303',
    patientId: 'P1720633203',
    patientName: 'Peter Jones',
    customerType: 'Registered',
    billDate: today.toISOString(),
    items: [
      { itemId: 'MED002', itemName: 'Amoxicillin 250mg', quantity: 10, pricePerUnit: 15, gstRate: 12, total: 150, gstAmount: 18, batchNumber: 'AMX-201', expiryDate: new Date('2025-10-31T23:59:59Z').toISOString(), discountPercentage: 0, discountAmount: 0, category: 'Medicine' },
      { itemId: 'RAD001', itemName: 'X-Ray Chest', quantity: 1, pricePerUnit: 1200, gstRate: 0, total: 1200, gstAmount: 0, batchNumber: 'NA', expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), discountPercentage: 0, discountAmount: 0, category: 'Radiology' },
    ],
    subTotal: 1350,
    totalDiscount: 0,
    totalGst: 18,
    grandTotal: 1368,
    paymentMethod: 'UPI',
    billType: 'Pharmacy',
    status: 'Finalized',
    requestedById: 'U004',
  },
  {
    id: 'B1720633304',
    patientId: 'P1720633201',
    patientName: 'John Doe',
    customerType: 'Registered',
    billDate: today.toISOString(),
    items: [
      { itemId: 'RAD001', itemName: 'X-Ray Chest', quantity: 1, pricePerUnit: 1200, gstRate: 0, total: 1080, gstAmount: 0, batchNumber: 'NA', expiryDate: new Date('2999-12-31T23:59:59Z').toISOString(), discountPercentage: 10, discountAmount: 120, category: 'Radiology' },
    ],
    subTotal: 1200,
    totalDiscount: 120,
    totalGst: 0,
    grandTotal: 1080,
    paymentMethod: 'Cash',
    billType: 'Services',
    status: 'Pending Approval',
    requestedById: 'U003',
  },
];

export const MOCK_SALES_RETURNS: SalesReturn[] = [];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
    {
        id: 'RX1720633401',
        patientId: 'P1720633201',
        doctorId: 'D001',
        date: new Date('2024-10-26T10:15:00Z').toISOString(),
        presentingProblem: 'High cholesterol levels detected in routine checkup.',
        diagnosis: 'Hyperlipidemia',
        items: [
            { medicineId: 'MED003', medicineName: 'Atorvastatin 20mg', quantity: '30 tablets', interval: 'Once daily', duration: '30 days', route: 'Oral', directions: 'Take at bedtime.' },
        ],
        otherDirections: 'Follow up in one month. Monitor cholesterol levels. Low-fat diet recommended.'
    },
    {
        id: 'RX1720633402',
        patientId: 'P1720633202',
        doctorId: 'U002',
        date: new Date('2024-10-25T14:45:00Z').toISOString(),
        presentingProblem: 'Patient complains of mild fever and body ache.',
        diagnosis: 'Viral Fever',
        items: [
            { medicineId: 'MED001', medicineName: 'Paracetamol 500mg', quantity: '10 tablets', interval: 'As needed for pain/fever (max 4 times a day)', duration: '5 days', route: 'Oral', directions: 'Take with food if stomach upset occurs.' },
        ],
        otherDirections: 'Rest and stay hydrated.'
    }
];

export const MOCK_EXPERIENCE_LETTER_REQUESTS: ExperienceLetterRequest[] = [];

export const MOCK_REQUISITIONS: RequisitionRequest[] = [];

export const MOCK_LAB_REQUESTS: LabRequest[] = [
    {
        id: 'LAB001',
        patientId: 'P1720633202',
        doctorId: 'U002',
        date: new Date('2024-10-25T14:45:00Z').toISOString(),
        tests: [
            { testId: 'PAT001', testName: 'Complete Blood Count (CBC)' }
        ],
        status: 'Report Ready',
    }
];


export const MOCK_POS: PurchaseOrder[] = [
  { 
    id: 'PO001', 
    vendorId: 'V001',
    vendorName: 'Pharma Solutions Inc.',
    orderDate: new Date('2024-10-20T11:00:00Z').toISOString(), 
    items: [{productCode: 'MED001', itemName: 'Paracetamol 500mg', quantity: 200, costPrice: 1.8, discountPercentage: 5, gstRate: 5, category: 'Medicine'}], 
    status: 'Completed',
    subTotal: 360,
    totalDiscount: 18,
    totalGst: 17.1,
    grandTotal: 359.1,
  },
  { 
    id: 'PO002', 
    vendorId: 'V002',
    vendorName: 'MedSupply Co.',
    orderDate: new Date('2024-10-22T15:00:00Z').toISOString(), 
    items: [{productCode: 'CON001', itemName: 'Syringes 10ml', quantity: 300, costPrice: 3.5, discountPercentage: 0, gstRate: 12, category: 'Consumable'}], 
    status: 'Pending',
    subTotal: 1050,
    totalDiscount: 0,
    totalGst: 126,
    grandTotal: 1176,
  },
];

export const MOCK_GRNS: GoodsReceiptNote[] = [
    { 
      id: 'GRN001', 
      poId: 'PO001', 
      vendorId: 'V001', 
      vendorName: 'Pharma Solutions Inc.', 
      receivedDate: new Date('2024-10-24T09:00:00Z').toISOString(), 
      invoiceFileName: 'invoice-pharma-solutions-1024.pdf',
      items: [{
        productCode: 'MED001',
        itemName: 'Paracetamol 500mg', 
        orderedQuantity: 200, 
        receivedQuantity: 200, 
        costPrice: 1.8, 
        gstRate: 5, 
        category: 'Medicine',
        batchNumber: 'PCTM-102',
        expiryDate: new Date('2027-06-30T23:59:59Z').toISOString(),
        mrp: 2.5,
      }] 
    },
];

export const MOCK_PATIENT_VISITS: PatientVisit[] = [
    { 
        id: 'V001', 
        patientId: 'P1720633201', 
        patientName: 'John Doe',
        assignedDoctorId: 'D001',
        checkInTime: new Date(Date.now() - 15 * 60000).toISOString(), // 15 mins ago
        status: 'Waiting for Doctor',
        statusUpdateTime: new Date(Date.now() - 15 * 60000).toISOString(),
    },
    { 
        id: 'V002', 
        patientId: 'P1720633202', 
        patientName: 'Jane Smith',
        assignedDoctorId: 'U002',
        checkInTime: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
        status: 'In Consultation',
        statusUpdateTime: new Date(Date.now() - 5 * 60000).toISOString(), // 5 mins ago
    },
    { 
        id: 'V003', 
        patientId: 'P1720633203', 
        patientName: 'Peter Jones',
        assignedDoctorId: 'U002',
        checkInTime: new Date(Date.now() - 25 * 60000).toISOString(), // 25 mins ago
        status: 'Waiting for Doctor',
        statusUpdateTime: new Date(Date.now() - 2 * 60000).toISOString(), // 2 mins ago
    },
];

export const MOCK_APPOINTMENT_REQUESTS: AppointmentRequest[] = [
    { id: 'AR001', patientName: 'Amit Patel', patientAddress: '101 Lotus Building, Mumbai', patientEmail: 'amit.patel@example.com', patientMobile: '9820098200', requestType: 'Doctor', requestDetail: 'Dr. Emily Carter', problem: 'Chest pain and shortness of breath.', status: 'Pending' },
    { id: 'AR002', patientName: 'Priya Singh', patientAddress: '25B Rose Apartments, Delhi', patientEmail: 'priya.singh@example.com', patientMobile: '9810098100', requestType: 'Test', requestDetail: 'Complete Blood Count (CBC)', problem: 'General weakness and fatigue for 2 weeks.', status: 'Pending' },
    { id: 'AR003', patientName: 'Rajesh Kumar', patientAddress: '42, MG Road, Bengaluru', patientEmail: 'rajesh.k@example.com', patientMobile: '9845098450', requestType: 'Doctor', requestDetail: 'Dr. Ben Joshi', problem: 'Follow-up appointment for knee injury.', status: 'Confirmed', appointmentDate: '2024-11-28', appointmentTime: '11:00' },
    { id: 'AR004', patientName: 'Sunita Sharma', patientAddress: 'Flat 5, Park Avenue, Kolkata', patientEmail: 'sunita.s@example.com', patientMobile: '9830098300', requestType: 'Doctor', requestDetail: 'Dr. Priya Sharma', problem: 'Recurring headaches and dizziness.', status: 'Confirmed', appointmentDate: '2024-11-28', appointmentTime: '15:30' },
    { id: 'AR005', patientName: 'Vikram Reddy', patientAddress: 'Plot 78, Jubilee Hills, Hyderabad', patientEmail: 'vikram.r@example.com', patientMobile: '9885098850', requestType: 'Test', requestDetail: 'X-Ray Chest', problem: 'Persistent cough after viral fever.', status: 'Pending' },
];

const todayStr = new Date().toISOString().split('T')[0];

export const MOCK_DUTY_ROSTER: DutyAssignment[] = (() => {
    const assignments: DutyAssignment[] = [];
    const year = 2024;
    const month = 10; // November (0-indexed month)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const staff = MOCK_USERS.filter(u => ['Doctor', 'Nurse', 'Receptionist', 'Paramedical'].includes(u.role));
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day).toISOString().split('T')[0];
        assignments.push({ id: `DA${Math.random()}`, userId: staff[day % staff.length].id, date, shift: 'Morning (9AM-5PM)'});
        assignments.push({ id: `DA${Math.random()}`, userId: staff[(day + 1) % staff.length].id, date, shift: 'Morning (9AM-5PM)'});
        assignments.push({ id: `DA${Math.random()}`, userId: staff[(day + 2) % staff.length].id, date, shift: 'Evening (1PM-9PM)'});
        assignments.push({ id: `DA${Math.random()}`, userId: staff[(day + 3) % staff.length].id, date, shift: 'Night (9PM-7AM)'});
    }
    return assignments;
})();


export const MOCK_LEAVE_REQUESTS: LeaveRequest[] = [
    { id: 'L001', userId: 'U005', userName: 'Nancy Nurse', startDate: '2024-11-10', endDate: '2024-11-12', reason: 'Family event', status: 'Approved', leaveType: 'Casual' },
    { id: 'L002', userId: 'U003', userName: 'Sarah Connor', startDate: '2024-11-20', endDate: '2024-11-20', reason: 'Personal work', status: 'Pending Admin Approval', leaveType: 'Casual' },
    { id: 'L003', userId: 'U006', userName: 'Peter Paramedic', startDate: '2024-11-22', endDate: '2024-11-23', reason: 'Medical checkup', status: 'Pending HR Approval', leaveType: 'Sick' },
];

export const MOCK_ROSTER_CHANGE_REQUESTS: RosterChangeRequest[] = [
    { id: 'RC001', userId: 'U003', userName: 'Sarah Connor', date: '2024-11-25', requestedShift: 'Morning (9AM-5PM)', reason: 'Shift swap with colleague', status: 'Pending Admin Approval'}
]

export const MOCK_ROSTER_UPDATE_REQUESTS: RosterUpdateRequest[] = [];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
    { id: 'A001', userId: 'U002', userName: 'Dr. Ben Joshi', date: todayStr, checkIn: '08:55', checkOut: '17:05', status: 'Present'},
    { id: 'A002', userId: 'U003', userName: 'Sarah Connor', date: todayStr, checkIn: '08:30', checkOut: '17:30', status: 'Present'},
    { id: 'A003', userId: 'U004', userName: 'Mike Pharmacist', date: todayStr, checkIn: '09:10', checkOut: null, status: 'Present'},
];

export const MOCK_HOLIDAYS: Holiday[] = [
    { date: '2024-01-26', name: 'Republic Day' },
    { date: '2024-03-25', name: 'Holi' },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-04-11', name: 'Id-ul-Fitr' },
    { date: '2024-04-17', name: 'Ram Navami' },
    { date: '2024-04-21', name: 'Mahavir Jayanti' },
    { date: '2024-05-23', name: 'Buddha Purnima' },
    { date: '2024-06-17', name: 'Id-ul-Zuha (Bakrid)' },
    { date: '2024-07-17', name: 'Muharram' },
    { date: '2024-08-15', name: 'Independence Day' },
    { date: '2024-08-26', name: 'Janmashtami' },
    { date: '2024-09-16', name: 'Milad-un-Nabi (Id-e-Milad)' },
    { date: '2024-10-02', name: 'Gandhi Jayanti' },
    { date: '2024-10-12', name: 'Dussehra' },
    { date: '2024-10-31', name: 'Diwali (Deepavali)' },
    { date: '2024-11-15', name: "Guru Nanak's Birthday" },
    { date: '2024-12-25', name: 'Christmas Day' },
];

export const MOCK_SALARY_SLIPS: SalarySlip[] = [
    { 
        id: 'S001', userId: 'U002', month: 10, year: 2024, basicPay: 80000,
        allowances: [{name: 'HRA', amount: 16000}, {name: 'Travel', amount: 5000}],
        deductions: [{name: 'Provident Fund', amount: 4000}, {name: 'Tax', amount: 8000}],
        netSalary: 89000
    },
     { 
        id: 'S002', userId: 'U003', month: 10, year: 2024, basicPay: 35000,
        allowances: [{name: 'HRA', amount: 7000}],
        deductions: [{name: 'Provident Fund', amount: 1800}, {name: 'Tax', amount: 2000}],
        netSalary: 38200
    },
];

export const MOCK_SALARIES: EmployeeSalary[] = MOCK_USERS.map(user => {
    let basicPay = 30000;
    if (user.role === 'Doctor') basicPay = 80000;
    if (user.role === 'Admin') basicPay = 60000;
    if (user.role === 'Master IT') basicPay = 90000;
    if (user.role === 'HR') basicPay = 50000;
    if (user.role === 'Pharmacist' || user.role === 'Nurse') basicPay = 40000;
    if (user.role === 'Receptionist') basicPay = 35000;

    return {
        userId: user.id,
        basicPay,
        allowances: [{ name: 'HRA', amount: basicPay * 0.2 }],
        deductions: [{ name: 'Provident Fund', amount: basicPay * 0.05 }, { name: 'Tax', amount: basicPay * 0.1 }]
    };
});

export const MOCK_APPLICANTS: Applicant[] = [
  { id: 'APP001', name: 'Alice Johnson', positionApplied: 'Registered Nurse', status: 'CV Received', applicationDate: new Date('2024-10-28T10:00:00Z').toISOString() },
  { id: 'APP002', name: 'Bob Williams', positionApplied: 'Pharmacist', status: 'Interview Scheduled', applicationDate: new Date('2024-10-27T14:00:00Z').toISOString(), interviewDetails: { date: '2024-11-05', time: '11:00', interviewerId: 'U004', interviewerName: 'Mike Pharmacist' } },
  { id: 'APP003', name: 'Charlie Brown', positionApplied: 'Receptionist', status: 'Interview Done', applicationDate: new Date('2024-10-26T09:00:00Z').toISOString(), interviewDetails: { date: '2024-11-02', time: '15:00', interviewerId: 'U003', interviewerName: 'Sarah Connor' }, feedback: 'Good communication skills, but lacks experience with our specific software.' },
  { id: 'APP004', name: 'Diana Prince', positionApplied: 'Doctor - Cardiology', status: 'Approved', applicationDate: new Date('2024-10-25T11:00:00Z').toISOString(), interviewDetails: { date: '2024-11-01', time: '10:00', interviewerId: 'U002', interviewerName: 'Dr. Ben Joshi' }, feedback: 'Excellent candidate, strong background in cardiology. Highly recommended.' },
  { id: 'APP005', name: 'Ethan Hunt', positionApplied: 'Store Incharge', status: 'Rejected', applicationDate: new Date('2024-10-24T16:00:00Z').toISOString(), interviewDetails: { date: '2024-10-30', time: '14:00', interviewerId: 'U008', interviewerName: 'Steve Storeman' }, feedback: 'Not a good fit for the team culture.' },
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG1', timestamp: new Date('2024-10-26T10:00:05Z').toISOString(), userId: 'U003', userName: 'Sarah Connor', action: 'PATIENT_CREATED', details: 'Created patient John Doe (P1720633201).' },
  { id: 'LOG2', timestamp: new Date('2024-10-26T10:15:20Z').toISOString(), userId: 'U004', userName: 'Mike Pharmacist', action: 'BILL_GENERATED', details: 'Generated bill B1720633301 for patient John Doe. Amount: ₹642.50.' },
  { id: 'LOG3', timestamp: new Date('2024-10-26T10:15:21Z').toISOString(), userId: 'U004', userName: 'Mike Pharmacist', action: 'INVENTORY_UPDATE', details: '[SALE] Stock for Paracetamol 500mg (Batch: PCTM-101) reduced by 20. From 170 to 150.' },
  { id: 'LOG4', timestamp: new Date('2024-10-26T11:00:00Z').toISOString(), userId: 'U001', userName: 'Admin User', action: 'USER_LOGIN', details: 'User \'Admin User\' logged in successfully.' },
];

export const MOCK_SURGERIES: Surgery[] = [
    { id: 'S001', patientId: 'P1720633201', patientName: 'John Doe', doctorId: 'D001', procedure: 'Coronary Artery Bypass Graft', status: 'Completed', advisedDate: new Date('2024-10-26T11:00:00Z').toISOString(), scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString() },
    { id: 'S002', patientId: 'P1720633202', patientName: 'Jane Smith', doctorId: 'U002', procedure: 'Knee Replacement', status: 'Scheduled', advisedDate: new Date('2024-10-25T15:00:00Z').toISOString(), scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60000).toISOString() },
    { id: 'S003', patientId: 'P1720633203', patientName: 'Peter Jones', doctorId: 'U002', procedure: 'ACL Repair', status: 'Advised', advisedDate: new Date().toISOString() },
];