import React, { useState } from 'react';
import { DollarSign, Download, Calculator, FileCheck, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export function Payroll() {
  const [baseWage, setBaseWage] = useState(10000); // monthly base wage
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  // Dynamic salary component calculations
  const basicSalary = baseWage * 0.50;
  const hra = baseWage * 0.20;
  const standardAllowance = baseWage * 0.10;
  const performanceBonus = baseWage * 0.10;
  const lta = baseWage * 0.05;
  const fixedAllowance = baseWage * 0.05;

  const grossSalary = basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance;

  // Deductions
  const pf = basicSalary * 0.12;
  const profTax = 200;
  const unpaidLeaveDeduction = 0;

  const totalDeductions = pf + profTax + unpaidLeaveDeduction;
  const netPay = grossSalary - totalDeductions;
  const yearlyWage = baseWage * 12;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <PageHeader
        title="Salary Administration & Payroll"
        description="Accounting workspace for salary structure calculation, tax withholdings, and pay slip ledger."
        action={
          <div className="flex items-center space-x-2">
            <Button variant="secondary" size="sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Export Ledger</span>
            </Button>
            <Button variant="primary" size="sm">
              <FileCheck className="w-3.5 h-3.5 mr-1" />
              <span>Disburse August Payroll</span>
            </Button>
          </div>
        }
      />

      {/* Salary Administration Header Controls */}
      <div className="bg-white border border-stone-200/90 rounded-md p-3.5 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-plum-50 text-plum-900 border border-plum-200">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">Payroll Computation Ledger</h2>
            <p className="text-xs text-stone-500">Select employee record or adjust base wage to preview recalculated structure</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-stone-600 font-medium">Monthly Wage ($):</label>
          <input
            type="number"
            value={baseWage}
            onChange={(e) => setBaseWage(Number(e.target.value) || 0)}
            className="w-28 py-1 px-2.5 bg-stone-50 border border-stone-200 rounded font-mono text-xs font-bold text-stone-900 focus:outline-none focus:border-plum-800"
          />
        </div>
      </div>

      {/* Accounting Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-white border border-stone-200/80 rounded-md p-2.5 shadow-subtle text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Monthly Wage</span>
          <span className="text-sm font-bold font-mono text-stone-900">${baseWage.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-md p-2.5 shadow-subtle text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Yearly Wage</span>
          <span className="text-sm font-bold font-mono text-stone-900">${yearlyWage.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-md p-2.5 shadow-subtle text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Gross Salary</span>
          <span className="text-sm font-bold font-mono text-emerald-800">${grossSalary.toLocaleString()}</span>
        </div>
        <div className="bg-white border border-stone-200/80 rounded-md p-2.5 shadow-subtle text-center">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Deductions</span>
          <span className="text-sm font-bold font-mono text-rose-800">${totalDeductions.toLocaleString()}</span>
        </div>
        <div className="bg-plum-900 text-white rounded-md p-2.5 shadow-xs text-center border border-plum-950 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-plum-200 uppercase tracking-wider block">Net Pay</span>
          <span className="text-sm font-bold font-mono text-white">${netPay.toLocaleString()}</span>
        </div>
      </div>

      {/* Structured Financial Accounting Component Breakdown */}
      <div className="bg-white border border-stone-200/90 rounded-md overflow-hidden shadow-subtle">
        <div className="px-3.5 py-2 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">Salary Component Breakdown</span>
          <Badge variant="primary">Accounting Format</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Component Type</th>
                <th className="py-2.5 px-3">Component Name</th>
                <th className="py-2.5 px-3">Calculation Basis</th>
                <th className="py-2.5 px-3">Rate</th>
                <th className="py-2.5 px-3 text-right">Monthly Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {/* Earnings */}
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-semibold text-emerald-800" rowSpan={6}>Earnings</td>
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Basic Salary</td>
                <td className="py-2 px-3 text-stone-500">50% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">50.0%</td>
                <td className="py-2 px-3 text-right font-bold text-stone-900">${basicSalary.toLocaleString()}</td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">House Rent Allowance (HRA)</td>
                <td className="py-2 px-3 text-stone-500">20% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">20.0%</td>
                <td className="py-2 px-3 text-right text-stone-900">${hra.toLocaleString()}</td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Standard Allowance</td>
                <td className="py-2 px-3 text-stone-500">10% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">10.0%</td>
                <td className="py-2 px-3 text-right text-stone-900">${standardAllowance.toLocaleString()}</td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Performance Bonus</td>
                <td className="py-2 px-3 text-stone-500">10% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">10.0%</td>
                <td className="py-2 px-3 text-right text-stone-900">${performanceBonus.toLocaleString()}</td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Leave Travel Allowance (LTA)</td>
                <td className="py-2 px-3 text-stone-500">5% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">5.0%</td>
                <td className="py-2 px-3 text-right text-stone-900">${lta.toLocaleString()}</td>
              </tr>
              <tr className="bg-stone-50/30">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Fixed Allowance</td>
                <td className="py-2 px-3 text-stone-500">5% of Base Wage</td>
                <td className="py-2 px-3 text-stone-500">5.0%</td>
                <td className="py-2 px-3 text-right text-stone-900">${fixedAllowance.toLocaleString()}</td>
              </tr>

              {/* Deductions */}
              <tr className="bg-rose-50/20">
                <td className="py-2 px-3 font-sans font-semibold text-rose-800" rowSpan={3}>Deductions</td>
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Provident Fund (PF)</td>
                <td className="py-2 px-3 text-stone-500">12% of Basic Salary</td>
                <td className="py-2 px-3 text-stone-500">12.0%</td>
                <td className="py-2 px-3 text-right text-rose-900">-${pf.toLocaleString()}</td>
              </tr>
              <tr className="bg-rose-50/20">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Professional Tax</td>
                <td className="py-2 px-3 text-stone-500">Statutory Standard Deduction</td>
                <td className="py-2 px-3 text-stone-500">Fixed</td>
                <td className="py-2 px-3 text-right text-rose-900">-${profTax.toLocaleString()}</td>
              </tr>
              <tr className="bg-rose-50/20">
                <td className="py-2 px-3 font-sans font-medium text-stone-900">Unpaid Leave Deduction</td>
                <td className="py-2 px-3 text-stone-500">0 days deducted</td>
                <td className="py-2 px-3 text-stone-500">0.0%</td>
                <td className="py-2 px-3 text-right text-stone-400">$0</td>
              </tr>

              {/* Totals */}
              <tr className="bg-stone-100 font-sans font-bold text-xs text-stone-900 border-t border-stone-200">
                <td colSpan={4} className="py-2.5 px-3">NET DISBURSABLE AMOUNT</td>
                <td className="py-2.5 px-3 text-right font-mono text-plum-900 text-sm">${netPay.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
