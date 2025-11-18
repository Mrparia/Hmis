import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Patient, Bill, InventoryItem, PurchaseOrder, GoodsReceiptNote, Doctor, Prescription, User, LeaveRequest, AttendanceRecord, SalarySlip, DutyAssignment, Vendor, BillItem, InventoryBatch, GRNItem, EmployeeSalary, Applicant, AuditLog, Holiday, RosterChangeRequest, LeaveRequestStatus, BillStatus, PaymentMethod, PatientVisit, PatientStatus, Surgery, RosterUpdateRequest, RosterUpdateRequestStatus, AppointmentRequest, LabRequest, MedicalHistory, SalesReturn, SalesReturnItem, EmployeeLeaveBalance, ApplicantStatus, RequisitionRequest, ExperienceLetterRequest } from '../types';
import { MOCK_PATIENTS, MOCK_INVENTORY, MOCK_BILLS, MOCK_POS, MOCK_GRNS, MOCK_DOCTORS, MOCK_PRESCRIPTIONS, MOCK_USERS, MOCK_DUTY_ROSTER, MOCK_LEAVE_REQUESTS, MOCK_ATTENDANCE, MOCK_SALARY_SLIPS, MOCK_VENDORS, MOCK_SALARIES, MOCK_APPLICANTS, MOCK_AUDIT_LOGS, MOCK_HOLIDAYS, MOCK_ROSTER_CHANGE_REQUESTS, MOCK_PATIENT_VISITS, MOCK_SURGERIES, MOCK_ROSTER_UPDATE_REQUESTS, MOCK_APPOINTMENT_REQUESTS, MOCK_LAB_REQUESTS, MOCK_SALES_RETURNS, MOCK_LEAVE_BALANCES, MOCK_REQUISITIONS, MOCK_EXPERIENCE_LETTER_REQUESTS } from '../constants';

interface AppState {
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  patients: Patient[];
  patientVisits: PatientVisit[];
  doctors: Doctor[];
  vendors: Vendor[];
  inventory: InventoryItem[];
  bills: Bill[];
  salesReturns: SalesReturn[];
  prescriptions: Prescription[];
  labRequests: LabRequest[];
  purchaseOrders: PurchaseOrder[];
  goodsReceiptNotes: GoodsReceiptNote[];
  dutyRoster: DutyAssignment[];
  holidays: Holiday[];
  leaveRequests: LeaveRequest[];
  leaveBalances: EmployeeLeaveBalance[];
  rosterChangeRequests: RosterChangeRequest[];
  rosterUpdateRequests: RosterUpdateRequest[];
  attendanceRecords: AttendanceRecord[];
  salarySlips: SalarySlip[];
  employeeSalaries: EmployeeSalary[];
  applicants: Applicant[];
  auditLogs: AuditLog[];
  surgeries: Surgery[];
  appointmentRequests: AppointmentRequest[];
  requisitionRequests: RequisitionRequest[];
  experienceLetterRequests: ExperienceLetterRequest[];
  documentToPrint: { type: string; data: any } | null;
}

type Action =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT'; payload: Patient }
  | { type: 'CHECK_IN_PATIENT'; payload: Patient }
  | { type: 'UPDATE_PATIENT_STATUS'; payload: { visitId: string; newStatus: PatientStatus } }
  | { type: 'ADD_DOCTOR'; payload: Doctor }
  | { type: 'UPDATE_DOCTOR'; payload: Doctor }
  | { type: 'ADD_VENDOR'; payload: Vendor }
  | { type: 'ADD_EMPLOYEE'; payload: { newUser: User; newSalary: EmployeeSalary } }
  | { type: 'DELETE_USER'; payload: { userId: string } }
  | { type: 'ADD_SERVICE'; payload: InventoryItem }
  | { type: 'UPDATE_SERVICE'; payload: InventoryItem }
  | { type: 'ADD_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL_STATUS'; payload: { billId: string; status: BillStatus } }
  | { type: 'FINALIZE_BILL'; payload: { billId: string; paymentMethod: PaymentMethod } }
  | { type: 'CANCEL_BILL', payload: { billId: string } }
  | { type: 'SALES_RETURN', payload: { originalBillId: string; itemsToReturn: SalesReturnItem[] } }
  | { type: 'ADD_PRESCRIPTION'; payload: Prescription }
  | { type: 'APPLY_LEAVE'; payload: LeaveRequest }
  | { type: 'UPDATE_LEAVE_STATUS'; payload: { id: string; status: LeaveRequestStatus } }
  | { type: 'REQUEST_ROSTER_CHANGE'; payload: RosterChangeRequest }
  | { type: 'UPDATE_ROSTER_CHANGE_STATUS'; payload: { id: string; status: LeaveRequestStatus } }
  | { type: 'SUBMIT_ROSTER_UPDATE'; payload: RosterUpdateRequest }
  | { type: 'UPDATE_ROSTER_UPDATE_STATUS'; payload: { id: string; status: RosterUpdateRequestStatus } }
  | { type: 'ADD_PO'; payload: PurchaseOrder }
  | { type: 'ADD_GRN'; payload: GoodsReceiptNote }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: { itemId: string } }
  | { type: 'ADD_REQUISITION'; payload: RequisitionRequest }
  | { type: 'UPDATE_REQUISITION_STATUS'; payload: { id: string, status: RequisitionRequest['status'] } }
  | { type: 'SET_DOCUMENT_TO_PRINT', payload: { type: string, data: any } }
  | { type: 'CLEAR_PRINT' }
  | { type: 'GENERATE_SALARY_SLIP'; payload: SalarySlip }
  | { type: 'REQUEST_EXPERIENCE_LETTER'; payload: ExperienceLetterRequest }
  | { type: 'GENERATE_EXPERIENCE_LETTER'; payload: { requestId: string } }
  | { type: 'ADD_APPLICANT'; payload: Applicant }
  | { type: 'UPDATE_APPLICANT'; payload: Applicant }
  | { type: 'CONFIRM_APPOINTMENT'; payload: { requestId: string; appointmentDate: string; appointmentTime: string; } }
  | { type: 'SCHEDULE_POST_OP'; payload: { surgery: Surgery; appointmentDate: string; appointmentTime: string; } }
  | {
      type: 'ONBOARD_APPLICANT';
      payload: {
        applicantId: string;
        newUser: User;
        newSalary: EmployeeSalary;
      };
    }
  | { 
      type: 'FINALIZE_DOCTOR_VISIT'; 
      payload: {
        visit: PatientVisit;
        vitals: Patient['vitals'];
        medicalHistory: MedicalHistory;
        prescription: Prescription;
        labRequest: LabRequest | null;
      }
    };


const initialState: AppState = {
  isAuthenticated: false,
  currentUser: null,
  users: MOCK_USERS,
  patients: MOCK_PATIENTS,
  patientVisits: MOCK_PATIENT_VISITS,
  doctors: MOCK_DOCTORS,
  vendors: MOCK_VENDORS,
  inventory: MOCK_INVENTORY,
  bills: MOCK_BILLS,
  salesReturns: MOCK_SALES_RETURNS,
  prescriptions: MOCK_PRESCRIPTIONS,
  labRequests: MOCK_LAB_REQUESTS,
  purchaseOrders: MOCK_POS,
  goodsReceiptNotes: MOCK_GRNS,
  dutyRoster: MOCK_DUTY_ROSTER,
  holidays: MOCK_HOLIDAYS,
  leaveRequests: MOCK_LEAVE_REQUESTS,
  leaveBalances: MOCK_LEAVE_BALANCES,
  rosterChangeRequests: MOCK_ROSTER_CHANGE_REQUESTS,
  rosterUpdateRequests: MOCK_ROSTER_UPDATE_REQUESTS,
  attendanceRecords: MOCK_ATTENDANCE,
  salarySlips: MOCK_SALARY_SLIPS,
  employeeSalaries: MOCK_SALARIES,
  applicants: MOCK_APPLICANTS,
  auditLogs: MOCK_AUDIT_LOGS,
  surgeries: MOCK_SURGERIES,
  appointmentRequests: MOCK_APPOINTMENT_REQUESTS,
  requisitionRequests: MOCK_REQUISITIONS,
  experienceLetterRequests: MOCK_EXPERIENCE_LETTER_REQUESTS,
  documentToPrint: null,
};

const AppReducer = (state: AppState, action: Action): AppState => {
  const createLog = (currentUser: User, actionType: string, details: string): AuditLog => ({
      id: `LOG${Date.now()}${Math.random()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action: actionType,
      details,
  });

  switch (action.type) {
    case 'LOGIN_SUCCESS': {
        const user = action.payload;
        const loginLog = createLog(user, 'USER_LOGIN', `User '${user.name}' logged in successfully.`);
        return { 
            ...state, 
            isAuthenticated: true, 
            currentUser: user,
            auditLogs: [loginLog, ...state.auditLogs],
        };
    }
    case 'LOGOUT':
        return { ...state, isAuthenticated: false, currentUser: null };
    case 'ADD_PATIENT': {
      const newPatient = action.payload;
      const patientLog = createLog(state.currentUser!, 'PATIENT_CREATED', `Created patient ${newPatient.name} (${newPatient.id}).`);
      return { 
        ...state, 
        patients: [action.payload, ...state.patients],
        auditLogs: [patientLog, ...state.auditLogs]
      };
    }
    case 'UPDATE_PATIENT': {
        const updatedPatient = action.payload;
        const patientLog = createLog(state.currentUser!, 'PATIENT_UPDATED', `Updated patient details for ${updatedPatient.name} (${updatedPatient.id}).`);
        return {
            ...state,
            patients: state.patients.map(p => p.id === updatedPatient.id ? updatedPatient : p),
            auditLogs: [patientLog, ...state.auditLogs]
        };
    }
    case 'CHECK_IN_PATIENT': {
        const patient = action.payload;
        const now = new Date().toISOString();
        const newVisit: PatientVisit = {
            id: `V${Date.now()}`,
            patientId: patient.id,
            patientName: patient.name,
            assignedDoctorId: patient.assignedDoctorId,
            checkInTime: now,
            status: 'Waiting for Doctor',
            statusUpdateTime: now,
        };
        const checkInLog = createLog(state.currentUser!, 'PATIENT_CHECK_IN', `Patient ${patient.name} (${patient.id}) checked in.`);
        return {
            ...state,
            patientVisits: [newVisit, ...state.patientVisits],
            auditLogs: [checkInLog, ...state.auditLogs],
        };
    }
    case 'UPDATE_PATIENT_STATUS': {
        const { visitId, newStatus } = action.payload;
        const visit = state.patientVisits.find(v => v.id === visitId);
        if (!visit) return state;

        const statusLog = createLog(state.currentUser!, 'PATIENT_STATUS_UPDATE', `Status for patient ${visit.patientName} (${visit.patientId}) updated to '${newStatus}'.`);

        return {
            ...state,
            patientVisits: state.patientVisits.map(v => 
                v.id === visitId 
                ? { ...v, status: newStatus, statusUpdateTime: new Date().toISOString() } 
                : v
            ),
            auditLogs: [statusLog, ...state.auditLogs],
        };
    }
    case 'FINALIZE_DOCTOR_VISIT': {
        const { visit, vitals, medicalHistory, prescription, labRequest } = action.payload;
        const logs: AuditLog[] = [];
        let newStatus: PatientStatus = 'Waiting for Billing';
        let newPrescriptions = state.prescriptions;
        let newLabRequests = state.labRequests;

        logs.push(createLog(state.currentUser!, 'CONSULTATION_FINALIZED', `Consultation finalized for patient ${visit.patientName} (${visit.patientId}).`));

        // 1. Add prescription
        newPrescriptions = [prescription, ...state.prescriptions];
        logs.push(createLog(state.currentUser!, 'PRESCRIPTION_CREATED', `Prescription ${prescription.id} created for patient ${visit.patientName}.`));

        // 2. Add lab request if it exists
        if (labRequest) {
            newLabRequests = [labRequest, ...state.labRequests];
            logs.push(createLog(state.currentUser!, 'LAB_REQUEST_CREATED', `Lab request ${labRequest.id} created for patient ${visit.patientName}.`));
            newStatus = 'In Pathology';
        } else if (prescription.items.length > 0) {
            newStatus = 'Waiting for Pharmacy';
        }
        
        // 3. Update patient record with vitals and history
        const updatedPatients = state.patients.map(p => 
            p.id === visit.patientId 
            ? { ...p, vitals, medicalHistory } 
            : p
        );
        
        // 4. Update visit status
        const updatedVisits = state.patientVisits.map(v => 
            v.id === visit.id
            ? { ...v, status: newStatus, statusUpdateTime: new Date().toISOString(), prescriptionId: prescription.id, labRequestId: labRequest?.id }
            : v
        );
        
        return {
            ...state,
            patients: updatedPatients,
            prescriptions: newPrescriptions,
            labRequests: newLabRequests,
            patientVisits: updatedVisits,
            auditLogs: [...logs.reverse(), ...state.auditLogs]
        };
    }
    case 'ADD_DOCTOR':
        return { ...state, doctors: [action.payload, ...state.doctors] };
    case 'UPDATE_DOCTOR': {
        const updatedDoctor = action.payload;
        return {
            ...state,
            doctors: state.doctors.map(d => d.id === updatedDoctor.id ? updatedDoctor : d)
        };
    }
    case 'ADD_VENDOR':
        return { ...state, vendors: [action.payload, ...state.vendors] };
    case 'ADD_EMPLOYEE': {
      const log = createLog(state.currentUser!, 'USER_CREATED', `Created user ${action.payload.newUser.name} (${action.payload.newUser.id}) with role ${action.payload.newUser.role}.`);
        return {
            ...state,
            users: [action.payload.newUser, ...state.users],
            employeeSalaries: [action.payload.newSalary, ...state.employeeSalaries],
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'DELETE_USER': {
        const { userId } = action.payload;
        const userToDelete = state.users.find(u => u.id === userId);
        if (!userToDelete) return state;
        const log = createLog(state.currentUser!, 'USER_DELETED', `Deleted user ${userToDelete.name} (${userToDelete.id}).`);
        return {
            ...state,
            users: state.users.filter(u => u.id !== userId),
            doctors: state.doctors.filter(d => d.id !== userId),
            employeeSalaries: state.employeeSalaries.filter(s => s.userId !== userId),
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'ADD_SERVICE': {
      const log = createLog(state.currentUser!, 'SERVICE_CREATED', `Created service ${action.payload.name} (ID: ${action.payload.id}) with price ₹${action.payload.price}.`);
      return {
        ...state,
        inventory: [action.payload, ...state.inventory],
        auditLogs: [log, ...state.auditLogs],
      };
    }
    case 'UPDATE_SERVICE': {
      const { id, name, price, gstRate } = action.payload;
      const log = createLog(state.currentUser!, 'SERVICE_UPDATED', `Updated service ${name} (ID: ${id}). New Price: ₹${price}, New GST: ${gstRate}%.`);
      return {
        ...state,
        inventory: state.inventory.map(item => item.id === id ? { ...item, name, price, gstRate } : item),
        auditLogs: [log, ...state.auditLogs],
      };
    }
    case 'APPLY_LEAVE':
        return { ...state, leaveRequests: [{...action.payload, status: 'Pending Admin Approval'}, ...state.leaveRequests] };
    case 'UPDATE_LEAVE_STATUS':
        return {
            ...state,
            leaveRequests: state.leaveRequests.map(lr =>
                lr.id === action.payload.id ? { ...lr, status: action.payload.status } : lr
            ),
        };
    case 'REQUEST_ROSTER_CHANGE':
        return { ...state, rosterChangeRequests: [{...action.payload, status: 'Pending Admin Approval'}, ...state.rosterChangeRequests] };
    case 'UPDATE_ROSTER_CHANGE_STATUS':
         return {
            ...state,
            rosterChangeRequests: state.rosterChangeRequests.map(rc =>
                rc.id === action.payload.id ? { ...rc, status: action.payload.status } : rc
            ),
        };
    case 'SUBMIT_ROSTER_UPDATE':
        return {
            ...state,
            rosterUpdateRequests: [action.payload, ...state.rosterUpdateRequests],
        };
    case 'UPDATE_ROSTER_UPDATE_STATUS': {
        const { id, status } = action.payload;
        const request = state.rosterUpdateRequests.find(r => r.id === id);
        if (!request) return state;

        const updatedRequests = state.rosterUpdateRequests.map(r =>
            r.id === id ? { ...r, status } : r
        );

        if (status === 'Approved') {
            const { periodStartDate, periodEndDate, assignments: newAssignments } = request;
            
            // Filter out the old assignments within the approved period
            const otherAssignments = state.dutyRoster.filter(a => {
                return a.date < periodStartDate || a.date > periodEndDate;
            });
            
            // Combine with the new assignments
            const updatedRoster = [...otherAssignments, ...newAssignments];

            return {
                ...state,
                dutyRoster: updatedRoster,
                rosterUpdateRequests: updatedRequests,
            };
        }

        return {
            ...state,
            rosterUpdateRequests: updatedRequests,
        };
    }
    case 'ADD_BILL': {
      const bill = action.payload;
      let newLogs: AuditLog[] = [];
      let updatedInventory = state.inventory;
      const customerName = bill.customerType === 'Registered' ? bill.patientName : bill.customerName;

      if (bill.status === 'Finalized') {
          newLogs.push(createLog(state.currentUser!, 'BILL_GENERATED', `Generated bill ${bill.id} for ${customerName}. Amount: ₹${bill.grandTotal.toFixed(2)}.`));
          const updatedInventoryAfterBilling = [...state.inventory].map(i => ({...i, batches: i.batches.map(b => ({...b}))}));
          bill.items.forEach((billedItem: BillItem) => {
              const stockItem = updatedInventoryAfterBilling.find(item => item.id === billedItem.itemId);
              if (stockItem) {
                  const batch = stockItem.batches.find(b => b.batchNumber === billedItem.batchNumber);
                  if (batch) {
                      const oldStock = batch.stock;
                      batch.stock -= billedItem.quantity;
                      newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[SALE] Stock for ${billedItem.itemName} (Batch: ${billedItem.batchNumber}) reduced by ${billedItem.quantity}. From ${oldStock} to ${batch.stock}.`));
                  }
              }
          });
          updatedInventory = updatedInventoryAfterBilling;
      } else if (bill.status === 'Pending Approval') {
          newLogs.push(createLog(state.currentUser!, 'DISCOUNT_REQUEST', `Bill ${bill.id} for ${customerName} submitted for discount approval. Amount: ₹${bill.grandTotal.toFixed(2)}.`));
      }
      
      return { 
        ...state, 
        bills: [bill, ...state.bills],
        inventory: updatedInventory,
        auditLogs: [...newLogs.reverse(), ...state.auditLogs],
        documentToPrint: bill.status === 'Finalized' ? { type: 'BILL', data: bill } : state.documentToPrint,
      };
    }
    case 'UPDATE_BILL_STATUS': {
        const { billId, status } = action.payload;
        const billToUpdate = state.bills.find(b => b.id === billId);
        if (!billToUpdate) return state;
        const customerName = billToUpdate.customerType === 'Registered' ? billToUpdate.patientName : billToUpdate.customerName;

        const log = createLog(state.currentUser!, 'DISCOUNT_APPROVAL', `Discount for bill ${billId} for patient ${customerName} was ${status}.`);

        return {
            ...state,
            bills: state.bills.map(bill => bill.id === billId ? { ...bill, status } : bill),
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'FINALIZE_BILL': {
        const { billId, paymentMethod } = action.payload;
        const billToFinalize = state.bills.find(b => b.id === billId);
        if (!billToFinalize) return state;
        const customerName = billToFinalize.customerType === 'Registered' ? billToFinalize.patientName : billToFinalize.customerName;

        const newLogs: AuditLog[] = [];
        newLogs.push(createLog(state.currentUser!, 'BILL_FINALIZED', `Finalized bill ${billId} for ${customerName}. Amount: ₹${billToFinalize.grandTotal.toFixed(2)} with ${paymentMethod}.`));
        
        const updatedInventoryAfterBilling = [...state.inventory].map(i => ({...i, batches: i.batches.map(b => ({...b}))}));
        billToFinalize.items.forEach((billedItem: BillItem) => {
            const stockItem = updatedInventoryAfterBilling.find(item => item.id === billedItem.itemId);
            if (stockItem) {
                const batch = stockItem.batches.find(b => b.batchNumber === billedItem.batchNumber);
                if (batch) {
                    const oldStock = batch.stock;
                    batch.stock -= billedItem.quantity;
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[SALE] Stock for ${billedItem.itemName} (Batch: ${billedItem.batchNumber}) reduced by ${billedItem.quantity}. From ${oldStock} to ${batch.stock}.`));
                }
            }
        });
        
        const finalizedBill = { ...billToFinalize, status: 'Finalized' as BillStatus, paymentMethod, settledById: state.currentUser!.id };

        return {
            ...state,
            bills: state.bills.map(bill => bill.id === billId ? finalizedBill : bill),
            inventory: updatedInventoryAfterBilling,
            auditLogs: [...newLogs.reverse(), ...state.auditLogs],
            documentToPrint: { type: 'BILL', data: finalizedBill }
        };
    }
    case 'CANCEL_BILL': {
        const { billId } = action.payload;
        const billToCancel = state.bills.find(b => b.id === billId);
        if (!billToCancel || !['Finalized', 'Approved'].includes(billToCancel.status)) return state;

        const customerName = billToCancel.customerType === 'Registered' ? billToCancel.patientName : billToCancel.customerName;
        const newLogs: AuditLog[] = [createLog(state.currentUser!, 'BILL_CANCELLED', `Bill ${billId} for ${customerName} (Amount: ₹${billToCancel.grandTotal.toFixed(2)}) was cancelled.`)];
        
        const updatedInventory = [...state.inventory].map(i => ({...i, batches: i.batches.map(b => ({...b}))}));

        billToCancel.items.forEach(item => {
            const stockItem = updatedInventory.find(i => i.id === item.itemId);
            if (stockItem) {
                const batch = stockItem.batches.find(b => b.batchNumber === item.batchNumber);
                if (batch) {
                    const oldStock = batch.stock;
                    batch.stock += item.quantity;
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[CANCEL] Stock for ${item.itemName} (Batch: ${item.batchNumber}) reverted by ${item.quantity}. From ${oldStock} to ${batch.stock}.`));
                }
            }
        });

        return {
            ...state,
            bills: state.bills.map(bill => bill.id === billId ? { ...bill, status: 'Cancelled' } : bill),
            inventory: updatedInventory,
            auditLogs: [...newLogs.reverse(), ...state.auditLogs],
        };
    }
    case 'SALES_RETURN': {
        const { originalBillId, itemsToReturn } = action.payload;
        const originalBill = state.bills.find(b => b.id === originalBillId);
        if (!originalBill) return state;

        const totalRefundAmount = itemsToReturn.reduce((sum, item) => sum + item.returnAmount, 0);
        const customerName = originalBill.customerType === 'Registered' ? originalBill.patientName : originalBill.customerName;

        const newReturn: SalesReturn = {
            id: `SR${Date.now()}`,
            originalBillId,
            returnDate: new Date().toISOString(),
            returnedById: state.currentUser!.id,
            items: itemsToReturn,
            totalRefundAmount,
        };
        
        const newLogs: AuditLog[] = [createLog(state.currentUser!, 'SALES_RETURN', `Sales return processed for bill ${originalBillId} for ${customerName}. Refund: ₹${totalRefundAmount.toFixed(2)}`)];
        
        const updatedInventory = [...state.inventory].map(i => ({...i, batches: i.batches.map(b => ({...b}))}));
        itemsToReturn.forEach(item => {
             const stockItem = updatedInventory.find(i => i.id === item.itemId);
            if (stockItem) {
                const batch = stockItem.batches.find(b => b.batchNumber === item.batchNumber);
                if (batch) {
                    const oldStock = batch.stock;
                    batch.stock += item.quantity;
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[RETURN] Stock for ${item.itemName} (Batch: ${item.batchNumber}) increased by ${item.quantity}. From ${oldStock} to ${batch.stock}.`));
                }
            }
        });

        return {
            ...state,
            bills: state.bills.map(bill => bill.id === originalBillId ? { ...bill, status: 'Returned' } : bill),
            salesReturns: [newReturn, ...state.salesReturns],
            inventory: updatedInventory,
            auditLogs: [...newLogs.reverse(), ...state.auditLogs]
        };
    }
    case 'ADD_PRESCRIPTION':
        return { ...state, prescriptions: [action.payload, ...state.prescriptions] };
    case 'ADD_PO':
      return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] };
    case 'ADD_GRN': {
        const grn = action.payload;
        const newLogs: AuditLog[] = [];
        const updatedInventoryAfterGRN = [...state.inventory].map(i => ({...i, batches: i.batches.map(b => ({...b}))}));
        
        newLogs.push(createLog(state.currentUser!, 'GRN_CREATED', `Processed GRN ${grn.id} for PO ${grn.poId} from ${grn.vendorName}.`));
        
        grn.items.forEach((receivedItem: GRNItem) => {
            if (receivedItem.receivedQuantity <= 0) return;

            let stockItem = updatedInventoryAfterGRN.find(item => item.id === receivedItem.productCode);
            const newBatchData = { batchNumber: receivedItem.batchNumber, expiryDate: receivedItem.expiryDate, costPrice: receivedItem.costPrice, mrp: receivedItem.mrp };

            if (stockItem) { // Existing inventory item
                let batch = stockItem.batches.find(b => b.batchNumber === receivedItem.batchNumber);
                if (batch) { // Existing batch
                    const oldStock = batch.stock;
                    batch.stock += receivedItem.receivedQuantity;
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[GRN] Stock for ${receivedItem.itemName} (Batch: ${receivedItem.batchNumber}) increased by ${receivedItem.receivedQuantity}. From ${oldStock} to ${batch.stock}.`));
                } else { // New batch for existing item
                    stockItem.batches.push({ ...newBatchData, stock: receivedItem.receivedQuantity });
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[GRN] New batch ${receivedItem.batchNumber} for ${receivedItem.itemName} added with stock ${receivedItem.receivedQuantity}.`));
                }
                 if(receivedItem.mrp > stockItem.price) {
                    stockItem.price = receivedItem.mrp; // Update selling price if new MRP is higher
                }
            } else { // Product Registration: Add as a new item to inventory
                const newItem: InventoryItem = {
                    id: receivedItem.productCode, name: receivedItem.itemName, category: receivedItem.category,
                    reorderLevel: 10, price: receivedItem.mrp, gstRate: receivedItem.gstRate, // Set initial selling price to MRP
                    batches: [{ ...newBatchData, stock: receivedItem.receivedQuantity }],
                };
                updatedInventoryAfterGRN.push(newItem);
                newLogs.push(createLog(state.currentUser!, 'INVENTORY_ADD', `[GRN] New product ${receivedItem.itemName} (${receivedItem.productCode}) registered with batch ${receivedItem.batchNumber} and stock ${receivedItem.receivedQuantity}.`));
            }
        });

        const updatedPOs: PurchaseOrder[] = state.purchaseOrders.map(po => po.id === grn.poId ? {...po, status: 'Completed'} : po)

        return { 
            ...state, 
            goodsReceiptNotes: [grn, ...state.goodsReceiptNotes],
            inventory: updatedInventoryAfterGRN,
            purchaseOrders: updatedPOs,
            auditLogs: [...newLogs.reverse(), ...state.auditLogs]
        };
    }
     case 'UPDATE_INVENTORY_ITEM': {
      const updatedItem = action.payload;
      const log = createLog(state.currentUser!, 'INVENTORY_MASTER_UPDATE', `Master details updated for item ${updatedItem.name} (${updatedItem.id}).`);
      return {
        ...state,
        inventory: state.inventory.map(item => item.id === updatedItem.id ? updatedItem : item),
        auditLogs: [log, ...state.auditLogs],
      };
    }
    case 'DELETE_INVENTORY_ITEM': {
      const { itemId } = action.payload;
      const itemToDelete = state.inventory.find(i => i.id === itemId);
      if (!itemToDelete) return state;
      const log = createLog(state.currentUser!, 'INVENTORY_MASTER_DELETE', `Deleted item ${itemToDelete.name} (${itemToDelete.id}) from inventory master.`);
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== itemId),
        auditLogs: [log, ...state.auditLogs],
      };
    }
    case 'ADD_REQUISITION': {
        const log = createLog(state.currentUser!, 'REQUISITION_RAISED', `Requisition ${action.payload.id} raised from ${action.payload.department}.`);
        return {
            ...state,
            requisitionRequests: [action.payload, ...state.requisitionRequests],
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'UPDATE_REQUISITION_STATUS': {
        const { id, status } = action.payload;
        const request = state.requisitionRequests.find(r => r.id === id);
        if (!request) return state;
        
        let newInventory = state.inventory;
        const newLogs: AuditLog[] = [createLog(state.currentUser!, 'REQUISITION_UPDATE', `Requisition ${id} from ${request.department} status updated to ${status}.`)];

        if (status === 'Fulfilled') {
            const updatedInventory = [...state.inventory].map(i => ({ ...i, batches: i.batches.map(b => ({ ...b })) }));

            for (const reqItem of request.items) {
                let quantityToDeduct = reqItem.quantity;
                const inventoryItem = updatedInventory.find(invItem => invItem.id === reqItem.itemId);
                if (!inventoryItem) continue;

                // Sort batches by expiry date (First-Expiry, First-Out)
                const sortedBatches = inventoryItem.batches
                    .filter(b => b.stock > 0)
                    .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

                for (const batch of sortedBatches) {
                    if (quantityToDeduct <= 0) break;
                    const deductAmount = Math.min(quantityToDeduct, batch.stock);
                    const oldStock = batch.stock;
                    batch.stock -= deductAmount;
                    quantityToDeduct -= deductAmount;
                    newLogs.push(createLog(state.currentUser!, 'INVENTORY_UPDATE', `[REQUISITION] Stock for ${reqItem.itemName} (Batch: ${batch.batchNumber}) reduced by ${deductAmount}. From ${oldStock} to ${batch.stock}.`));
                }
            }
            newInventory = updatedInventory;
        }

        return {
            ...state,
            inventory: newInventory,
            requisitionRequests: state.requisitionRequests.map(r => r.id === id ? { ...r, status } : r),
            auditLogs: [...newLogs, ...state.auditLogs],
        };
    }
    case 'GENERATE_SALARY_SLIP':
        const slipExists = state.salarySlips.some(
            slip => slip.userId === action.payload.userId &&
                    slip.month === action.payload.month &&
                    slip.year === action.payload.year
        );
        if (slipExists) {
            return state; 
        }
        return {
            ...state,
            salarySlips: [action.payload, ...state.salarySlips]
        };
    case 'REQUEST_EXPERIENCE_LETTER':
        const log = createLog(state.currentUser!, 'DOCUMENT_REQUEST', `User ${action.payload.userName} requested an experience letter.`);
        return {
            ...state,
            experienceLetterRequests: [action.payload, ...state.experienceLetterRequests],
            auditLogs: [log, ...state.auditLogs],
        };
    case 'GENERATE_EXPERIENCE_LETTER': {
        const { requestId } = action.payload;
        const request = state.experienceLetterRequests.find(r => r.id === requestId);
        if (!request) return state;
        const log = createLog(state.currentUser!, 'DOCUMENT_GENERATED', `Experience letter generated for ${request.userName}.`);
        return {
            ...state,
            experienceLetterRequests: state.experienceLetterRequests.map(r => r.id === requestId ? { ...r, status: 'Generated' } : r),
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'ADD_APPLICANT':
        return {
            ...state,
            applicants: [action.payload, ...state.applicants]
        };
    case 'UPDATE_APPLICANT':
        return {
            ...state,
            applicants: state.applicants.map(app =>
                app.id === action.payload.id ? action.payload : app
            )
        };
    case 'ONBOARD_APPLICANT': {
        const { applicantId, newUser, newSalary } = action.payload;
        const applicant = state.applicants.find(a => a.id === applicantId);
        if (!applicant) return state;

        const newLogs: AuditLog[] = [];
        newLogs.push(createLog(state.currentUser!, 'APPLICANT_ONBOARDED', `Applicant ${applicant.name} (${applicant.id}) has been onboarded as ${newUser.role} with Employee ID ${newUser.id}.`));

        const updatedApplicants = state.applicants.map(app => 
            app.id === applicantId ? { ...app, status: 'Onboarded' as ApplicantStatus } : app
        );

        let updatedDoctors = state.doctors;
        if (newUser.role === 'Doctor') {
            updatedDoctors = [{
                id: newUser.id,
                name: `Dr. ${newUser.name}`,
                qualification: 'MBBS', // Default qualification
                specialization: 'General', // Default specialization
            }, ...state.doctors];
            newLogs.push(createLog(state.currentUser!, 'DOCTOR_CREATED', `Doctor profile created for ${newUser.name} (${newUser.id}).`));
        }

        return {
            ...state,
            applicants: updatedApplicants,
            users: [newUser, ...state.users],
            employeeSalaries: [newSalary, ...state.employeeSalaries],
            doctors: updatedDoctors,
            auditLogs: [...newLogs.reverse(), ...state.auditLogs],
        };
    }
    case 'CONFIRM_APPOINTMENT': {
        const { requestId, appointmentDate, appointmentTime } = action.payload;
        const log = createLog(state.currentUser!, 'APPOINTMENT_CONFIRMED', `Confirmed appointment request ${requestId}.`);
        return {
            ...state,
            appointmentRequests: state.appointmentRequests.map(req =>
                req.id === requestId ? { ...req, status: 'Confirmed', appointmentDate, appointmentTime } : req
            ),
            auditLogs: [log, ...state.auditLogs],
        };
    }
    case 'SCHEDULE_POST_OP': {
        const { surgery, appointmentDate, appointmentTime } = action.payload;
        const log1 = createLog(state.currentUser!, 'APPOINTMENT_SCHEDULED', `Scheduled post-op checkup for ${surgery.patientName}.`);
        const log2 = createLog(state.currentUser!, 'SURGERY_STATUS_UPDATE', `Surgery ${surgery.id} for ${surgery.patientName} moved to Post-Op Scheduled.`);
        
        const patient = state.patients.find(p => p.id === surgery.patientId);
        if (!patient) return state;

        const newAppointment: AppointmentRequest = {
            id: `AR${Date.now()}`,
            patientName: surgery.patientName,
            patientAddress: patient.address,
            patientEmail: patient.contact, // Assuming contact is email
            patientMobile: patient.contact, // Assuming contact is also mobile
            requestType: 'Doctor',
            requestDetail: `Post-op checkup for ${surgery.procedure}`,
            problem: `Follow-up after surgery on ${new Date(surgery.scheduledDate!).toLocaleDateString()}`,
            status: 'Confirmed',
            appointmentDate,
            appointmentTime,
        };

        return {
            ...state,
            appointmentRequests: [newAppointment, ...state.appointmentRequests],
            surgeries: state.surgeries.map(s => 
                s.id === surgery.id ? { ...s, status: 'Post-Op Scheduled' } : s
            ),
            auditLogs: [log2, log1, ...state.auditLogs],
        };
    }
    case 'SET_DOCUMENT_TO_PRINT':
      return { ...state, documentToPrint: action.payload };
    case 'CLEAR_PRINT':
      return { ...state, documentToPrint: null };
    default:
      return state;
  }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);