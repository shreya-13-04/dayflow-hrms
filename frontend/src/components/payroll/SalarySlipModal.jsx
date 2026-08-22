import React from 'react';
import { X, Printer, Building2, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export function SalarySlipModal({ slip, onClose }) {
  if (!slip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-stone-300 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-dropdown p-6 space-y-5 text-stone-900 print:shadow-none print:border-none print:p-0">
        {/* Header Action Controls (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-stone-900 font-serif">Salary Slip Statement</span>
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-mono font-medium">
              ● Processed
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm" onClick={handlePrint}>
              <Printer className="w-3.5 h-3.5 mr-1" />
              <span>Print / Download PDF</span>
            </Button>
            <button onClick={onClose} className="p-1 text-stone-400 hover:text-stone-700 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Salary Slip Content */}
        <div className="space-y-4 print:p-6 print:bg-white">
          {/* Document Title Header */}
          <div className="flex justify-between items-start border-b-2 border-[#581c38] pb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded bg-[#581c38] text-white flex items-center justify-center font-serif text-sm font-bold">
                  D
                </div>
                <span className="font-serif font-bold text-xl tracking-wide text-stone-900 uppercase">DAYFLOW HRMS</span>
              </div>
              <p className="text-xs text-stone-500 font-medium">{slip.companyName || 'Dayflow Corporation'}</p>
            </div>
            <div className="text-right">
              <h2 className="text-base font-bold text-[#581c38] font-serif uppercase tracking-wider">Salary Slip</h2>
              <p className="text-xs font-mono font-semibold text-stone-700">{slip.period || 'August 2026'}</p>
            </div>
          </div>

          {/* Employee & Attendance Info Grid */}
          <div className="grid grid-cols-2 gap-4 bg-stone-50 p-3.5 rounded border border-stone-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Employee Name:</span>
                <span className="font-bold text-stone-900">{slip.employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Employee ID:</span>
                <span className="font-mono text-stone-900">{slip.employee?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Designation:</span>
                <span className="text-stone-800">{slip.employee?.designation || 'Software Engineer'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Department:</span>
                <span className="text-stone-800">{slip.employee?.department || 'Engineering'}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-l border-stone-200 pl-4">
              <div className="flex justify-between">
                <span className="text-stone-500">Working Days:</span>
                <span className="font-mono text-stone-900">{slip.attendance?.workingDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Present Days:</span>
                <span className="font-mono text-stone-900">{slip.attendance?.presentDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Paid Leave Days:</span>
                <span className="font-mono text-stone-900">{slip.attendance?.paidLeaveDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-bold text-stone-900">Payable Days:</span>
                <span className="font-mono font-bold text-[#581c38]">{slip.attendance?.payableDays} days</span>
              </div>
            </div>
          </div>

          {/* Earnings vs Deductions Table */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Earnings Column */}
            <div className="border border-stone-200 rounded overflow-hidden">
              <div className="bg-stone-100 px-3 py-1.5 font-bold uppercase text-[10px] tracking-wider text-stone-700 border-b border-stone-200">
                Earnings Breakdown
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600">Basic Salary</span>
                  <span className="font-mono font-semibold">${slip.earnings?.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">House Rent Allowance (HRA)</span>
                  <span className="font-mono font-semibold">${slip.earnings?.hra?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Standard Allowance</span>
                  <span className="font-mono">${slip.earnings?.standardAllowance?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Performance Bonus</span>
                  <span className="font-mono">${slip.earnings?.performanceBonus?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Leave Travel Allowance (LTA)</span>
                  <span className="font-mono">${slip.earnings?.lta?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Fixed Allowance</span>
                  <span className="font-mono">${slip.earnings?.fixedAllowance?.toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                  <span>Gross Earnings</span>
                  <span className="font-mono">${slip.earnings?.grossSalary?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-stone-200 rounded overflow-hidden">
              <div className="bg-stone-100 px-3 py-1.5 font-bold uppercase text-[10px] tracking-wider text-stone-700 border-b border-stone-200">
                Deductions Breakdown
              </div>
              <div className="p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-stone-600">Provident Fund (PF)</span>
                  <span className="font-mono font-semibold">${slip.deductions?.pf?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Professional Tax</span>
                  <span className="font-mono">${slip.deductions?.professionalTax?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Unpaid Leave Deduction</span>
                  <span className="font-mono text-rose-700 font-semibold">${slip.deductions?.unpaidLeaveDeduction?.toLocaleString()}</span>
                </div>
                <div className="pt-8 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-rose-800">${slip.deductions?.totalDeductions?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* NET PAY Summary Box */}
          <div className="p-4 bg-[#581c38] text-white rounded-md flex justify-between items-center shadow-subtle">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-plum-200">Net Payable Amount</div>
              <div className="text-xs text-plum-100">Calculated after applicable attendance deductions</div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono tracking-tight text-white">
                ${slip.netSalary?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-[10px] text-center text-stone-400 italic">
            This is a computer-generated salary slip statement from Dayflow HRMS and does not require a physical signature.
          </p>
        </div>
      </div>
    </div>
  );
}
