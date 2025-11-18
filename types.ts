export type View = 'DASHBOARD' | 'PATIENTS' | 'BILLING' | 'INVENTORY' | 'PROCUREMENT' | 'REPORTS' | 'DOCTORS' | 'EMPLOYEES' | 'AUDIT_LOG' | 'SETTINGS';

export type UserRole = 'Admin' | 'Doctor' | 'Receptionist' | 'Pharmacist' | 'Nurse' | 'Paramedical' | 'Housekeeping' | 'Store Incharge' | 'HR' | 'Master IT';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  dateOfBirth?: string; // ISO yyyy-mm-dd
  joiningDate?: string; // ISO string
}

export interface MedicalHistory {
  pastBloodSugar?: string;
  thyroidHistory?: string;
  pastSurgeries?: string;
  previousIllnesses?: string;
  drugAllergies?: string;
  familyMedicalHistory?: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  registeredDate: string; // ISO string
  address: string;
  pincode: string;
  city: string;
  state: string;
  patientType: 'OPD' | 'IPD';
  assignedDoctorId: string;
  bedInfo?: {
    ward: string;
    bedNumber: string;
  };
  vitals?: {
    bp: string; // e.g., "120/80"
    oxygenSaturation: number;
    heartRate: number;
    height: number; // in cm
    weight: number; // in kg
    bmi: number;
  };
  medicalHistory?: MedicalHistory;
}

export type PatientStatus = 'Waiting for Doctor' | 'In Consultation' | 'In Pathology' | 'Test in Progress' | 'Report Ready' | 'Waiting for Billing' | 'Waiting for Pharmacy' | 'Completed';

export interface PatientVisit {
  id: string;
  patientId: string;
  patientName: string;
  assignedDoctorId: string;
  checkInTime: string; // ISO
  status: PatientStatus;
  statusUpdateTime: string; // ISO
  prescriptionId?: string;
  labRequestId?: string;
}


export interface Doctor {
    id: string;
    name: string;
    qualification: string;
    specialization: string;
    registrationNumber?: string;
    signatureUrl?: string;
    availability?: {
        [day: string]: string[]; // e.g., { "Monday": ["09:00-13:00", "14:00-17:00"] }
    };
}

export interface InventoryBatch {
  batchNumber: string;
  stock: number;
  expiryDate: string; // ISO string
  costPrice: number;
  mrp?: number;
}

export interface InventoryItem {
  id: string; // Corresponds to productCode
  name: string;
  category: 'Medicine' | 'Consumable' | 'General' | 'Pathology' | 'Radiology';
  reorderLevel: number;
  price: number; // Selling price per unit
  gstRate: 0 | 5 | 12 | 18 | 28; // in percentage
  batches: InventoryBatch[];
}

export interface BillItem {
  itemId: string; // Corresponds to InventoryItem id
  itemName: string;
  quantity: number;
  pricePerUnit: number;
  gstRate: number;
  total: number; // Price after discount, before GST
  gstAmount: number;
  batchNumber: string;
  expiryDate: string;
  discountPercentage: number;
  discountAmount: number;
  category: InventoryItem['category'];
}

export type PaymentMethod = 'Cash' | 'Card' | 'UPI' | 'Insurance';
export type BillType = 'Pharmacy' | 'Services';
export type BillStatus = 'Pending Approval' | 'Approved' | 'Rejected' | 'Finalized' | 'Cancelled' | 'Returned';

export interface Bill {
  id: string;
  patientId?: string;
  patientName?: string;
  customerName?: string;
  customerContact?: string;
  customerType: 'Registered' | 'Walk-in';
  billDate: string; // ISO string
  items: BillItem[];
  subTotal: number; // Before discount
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  billType: BillType;
  status: BillStatus;
  requestedById: string;
  settledById?: string;
}

export interface SalesReturnItem {
    itemId: string;
    itemName: string;
    batchNumber: string;
    quantity: number;
    returnAmount: number;
}

export interface SalesReturn {
    id: string;
    originalBillId: string;
    returnDate: string; // ISO string
    returnedById: string;
    items: SalesReturnItem[];
    totalRefundAmount: number;
}


export type DosageRoute = 'Oral' | 'Topical' | 'Injection' | 'IV' | 'Other';

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: string;
  duration: string;
  interval: string;
  route: DosageRoute;
  directions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // ISO string
  presentingProblem: string;
  diagnosis: string;
  items: PrescriptionItem[];
  otherDirections: string;
  followUpDate?: string;
}

export interface LabRequestItem {
    testId: string;
    testName: string;
    notes?: string;
}

export type LabRequestStatus = 'Advised' | 'Sample Collected' | 'Report Ready';

export interface LabRequest {
    id: string;
    patientId: string;
    doctorId: string;
    date: string; // ISO
    tests: LabRequestItem[];
    status: LabRequestStatus;
}

export interface Vendor {
  id: string;
  name: string;
  gstNumber: string;
  drugLicenseNumber?: string;
  contactPerson: string;
  phone: string;
  address: string;
}

export interface PurchaseOrderItem {
  productCode: string;
  itemName: string;
  quantity: number;
  costPrice: number;
  discountPercentage: number;
  gstRate: 0 | 5 | 12 | 18 | 28;
  category: 'Medicine' | 'Consumable' | 'General';
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  vendorName: string;
  orderDate: string; // ISO string
  items: PurchaseOrderItem[];
  status: 'Pending' | 'Completed' | 'Cancelled';
  subTotal: number;
  totalDiscount: number;
  totalGst: number;
  grandTotal: number;
}

export interface GRNItem {
    productCode: string;
    itemName: string;
    orderedQuantity: number;
    receivedQuantity: number;
    costPrice: number;
    gstRate: 0 | 5 | 12 | 18 | 28;
    category: 'Medicine' | 'Consumable' | 'General';
    batchNumber: string;
    expiryDate: string; // ISO string
    mrp: number;
}

export interface GoodsReceiptNote {
  id: string;
  poId: string;
  vendorId: string;
  vendorName: string;
  receivedDate: string; // ISO string
  items: GRNItem[];
  invoiceFileName?: string;
}

export type LeaveType = 'Casual' | 'Sick' | 'Privileged';

export interface EmployeeLeaveBalance {
    userId: string;
    casual: number; // total quota
    sick: number; // total quota
    privileged: number; // total quota for the year
}

export type LeaveRequestStatus = 'Pending Admin Approval' | 'Pending HR Approval' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  startDate: string; // ISO
  endDate: string; // ISO
  reason: string;
  status: LeaveRequestStatus;
  leaveType: LeaveType;
}

export interface RosterChangeRequest {
    id: string;
    userId: string;
    userName: string;
    date: string; // ISO yyyy-mm-dd
    requestedShift: 'Morning (9AM-5PM)' | 'Evening (1PM-9PM)' | 'Night (9PM-7AM)';
    reason: string;
    status: LeaveRequestStatus;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string; // ISO yyyy-mm-dd
  checkIn: string | null; // ISO time
  checkOut: string | null; // ISO time
  status: 'Present' | 'Absent' | 'On Leave';
}

export interface SalarySlip {
    id: string;
    userId: string;
    month: number; // 1-12
    year: number;
    basicPay: number;
    allowances: { name: string, amount: number }[];
    deductions: { name: string, amount: number }[];
    netSalary: number;
}

export type Shift = 'Morning (9AM-5PM)' | 'Evening (1PM-9PM)' | 'Night (9PM-7AM)';

export interface DutyAssignment {
    id: string;
    userId: string;
    date: string; // ISO yyyy-mm-dd
    shift: Shift;
}

export type RosterUpdateRequestStatus = 'Pending HR Approval' | 'Approved' | 'Rejected';

export interface RosterUpdateRequest {
  id: string;
  requestedById: string;
  requestedByName: string;
  requestDate: string; // ISO
  periodStartDate: string; // ISO yyyy-mm-dd
  periodEndDate: string; // ISO yyyy-mm-dd
  assignments: DutyAssignment[]; // The new set of assignments for this period
  status: RosterUpdateRequestStatus;
}

export interface Holiday {
    date: string; // ISO yyyy-mm-dd
    name: string;
}

export interface EmployeeSalary {
    userId: string;
    basicPay: number;
    allowances: { name: string, amount: number }[];
    deductions: { name: string, amount: number }[];
}

export type ApplicantStatus = 'CV Received' | 'Interview Scheduled' | 'Interview Done' | 'Approved' | 'Rejected' | 'Onboarded';

export interface Applicant {
  id: string;
  name: string;
  positionApplied: string;
  status: ApplicantStatus;
  applicationDate: string; // ISO string
  interviewDetails?: {
    date: string; // ISO date string yyyy-mm-dd
    time: string; // HH:mm
    interviewerId: string;
    interviewerName: string;
  };
  feedback?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO string
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export type SurgeryStatus = 'Advised' | 'Scheduled' | 'Completed' | 'Post-Op Scheduled';

export interface Surgery {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  procedure: string;
  status: SurgeryStatus;
  advisedDate: string; // ISO string
  scheduledDate?: string; // ISO string
}

export type AppointmentRequestStatus = 'Pending' | 'Confirmed';

export interface AppointmentRequest {
  id: string;
  patientName: string;
  patientAddress: string;
  patientEmail: string;
  patientMobile: string;
  requestType: 'Doctor' | 'Test';
  requestDetail: string; // Doctor name or Test name
  problem: string;
  status: AppointmentRequestStatus;
  appointmentDate?: string; // ISO yyyy-mm-dd
  appointmentTime?: string; // HH:mm
}

export interface RequisitionRequestItem {
    itemId: string;
    itemName: string;
    quantity: number;
}

export type RequisitionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Fulfilled';

export interface RequisitionRequest {
    id: string;
    requestedById: string;
    requestedByName: string;
    department: UserRole;
    requestDate: string; // ISO
    items: RequisitionRequestItem[];
    status: RequisitionStatus;
}

export type ExperienceLetterRequestStatus = 'Pending' | 'Generated';

export interface ExperienceLetterRequest {
  id: string;
  userId: string;
  userName: string;
  requestDate: string; // ISO
  status: ExperienceLetterRequestStatus;
}
