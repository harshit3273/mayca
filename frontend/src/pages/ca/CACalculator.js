import React, { useState } from 'react';
import { FaCalculator, FaPercentage, FaRupeeSign, FaInfoCircle } from 'react-icons/fa';

const CACalculator = () => {
  const [activeTab, setActiveTab] = useState('gst');

  // GST State
  const [gstAmount, setGstAmount] = useState('');
  const [gstRate, setGstRate] = useState(18);
  const [gstType, setGstType] = useState('exclusive');

  // TDS State
  const [tdsAmount, setTdsAmount] = useState('');
  const [tdsRate, setTdsRate] = useState(10);

  // General Income Tax State (Simplified)
  const [taxIncome, setTaxIncome] = useState('');

  // Calculations
  const calculateGST = () => {
    const amt = parseFloat(gstAmount) || 0;
    const rate = parseFloat(gstRate) || 0;
    if (gstType === 'exclusive') {
      const tax = (amt * rate) / 100;
      return { base: amt, tax: tax, total: amt + tax };
    } else {
      const tax = amt - (amt * (100 / (100 + rate)));
      const base = amt - tax;
      return { base: base, tax: tax, total: amt };
    }
  };
  const gstResult = calculateGST();

  const calculateTDS = () => {
    const amt = parseFloat(tdsAmount) || 0;
    const rate = parseFloat(tdsRate) || 0;
    const tax = (amt * rate) / 100;
    return { base: amt, tax: tax, payable: amt - tax };
  };
  const tdsResult = calculateTDS();

  const calculateTax = () => {
    let income = parseFloat(taxIncome) || 0;
    // Extremely simplified old regime estimation for demonstration
    let tax = 0;
    if (income > 250000 && income <= 500000) tax = (income - 250000) * 0.05;
    else if (income > 500000 && income <= 1000000) tax = 12500 + ((income - 500000) * 0.2);
    else if (income > 1000000) tax = 112500 + ((income - 1000000) * 0.3);
    
    // Section 87A rebate
    if (income <= 500000) tax = 0;

    const cess = tax * 0.04;
    return { tax: tax, cess: cess, total: tax + cess };
  };
  const taxResult = calculateTax();

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors text-gray-900";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-2xl">
          <FaCalculator />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">All-In-One Tax Calculator</h2>
          <p className="text-sm text-gray-500 mt-0.5">Quick computations for GST, TDS, and basic Income Tax</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-white rounded-xl shadow-sm border border-gray-100 inline-flex">
        {[
          { id: 'gst', label: 'GST Calculator' },
          { id: 'tds', label: 'TDS Calculator' },
          { id: 'tax', label: 'Income Tax (Old Regime)' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === t.id ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" /> Enter Details
          </h3>

          {activeTab === 'gst' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amount (₹)</label>
                <input type="number" className={inputClass} value={gstAmount} onChange={e => setGstAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">GST Rate (%)</label>
                <select className={inputClass} value={gstRate} onChange={e => setGstRate(e.target.value)}>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Calculation Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="gstType" checked={gstType === 'exclusive'} onChange={() => setGstType('exclusive')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    GST Exclusive (Add Tax)
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="gstType" checked={gstType === 'inclusive'} onChange={() => setGstType('inclusive')} className="text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    GST Inclusive (Remove Tax)
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tds' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Base Amount (₹)</label>
                <input type="number" className={inputClass} value={tdsAmount} onChange={e => setTdsAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">TDS Rate (%)</label>
                <select className={inputClass} value={tdsRate} onChange={e => setTdsRate(e.target.value)}>
                  <option value={1}>1% (194C - Individual/HUF)</option>
                  <option value={2}>2% (194C - Others)</option>
                  <option value={5}>5% (194J - Tech Services)</option>
                  <option value={10}>10% (194J - Professional Services)</option>
                  <option value={10}>10% (194A - Interest)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Net Taxable Income (₹)</label>
                <input type="number" className={inputClass} value={taxIncome} onChange={e => setTaxIncome(e.target.value)} placeholder="0.00" />
                <p className="text-xs text-gray-400 mt-2">Note: This is a basic estimation for individuals below 60 years under the Old Regime. Does not include surcharge.</p>
              </div>
            </div>
          )}
        </div>

        {/* Result Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm border border-gray-700 p-6 text-white flex flex-col">
          <h3 className="font-semibold text-gray-300 mb-6 flex items-center gap-2">
            <FaPercentage className="text-blue-400" /> Calculation Result
          </h3>
          
          <div className="flex-1 space-y-4">
            {activeTab === 'gst' && (
              <>
                {gstType === 'exclusive' ? (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                      <span className="text-gray-400">Base Amount</span>
                      <span className="font-medium text-lg">₹{gstResult.base.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                      <span className="text-gray-400">GST ({gstRate}%)</span>
                      <span className="font-medium text-lg text-red-400">+ ₹{gstResult.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-300 font-semibold text-lg">Total Amount</span>
                      <span className="font-bold text-3xl text-green-400">₹{gstResult.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                      <span className="text-gray-400">Total Amount (Inclusive)</span>
                      <span className="font-medium text-lg">₹{gstResult.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                      <span className="text-gray-400">GST Deducted ({gstRate}%)</span>
                      <span className="font-medium text-lg text-red-400">- ₹{gstResult.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-300 font-semibold text-lg">Amount after Deduction</span>
                      <span className="font-bold text-3xl text-green-400">₹{gstResult.base.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </>
                )}
              </>
            )}

            {activeTab === 'tds' && (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                  <span className="text-gray-400">Invoice Amount</span>
                  <span className="font-medium text-lg">₹{tdsResult.base.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                  <span className="text-gray-400">TDS Deducted ({tdsRate}%)</span>
                  <span className="font-medium text-lg text-red-400">- ₹{tdsResult.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-300 font-semibold text-lg">Net Payable</span>
                  <span className="font-bold text-3xl text-green-400">₹{tdsResult.payable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {activeTab === 'tax' && (
              <>
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                  <span className="text-gray-400">Basic Tax</span>
                  <span className="font-medium text-lg">₹{taxResult.tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                  <span className="text-gray-400">Health & Ed Cess (4%)</span>
                  <span className="font-medium text-lg text-red-400">+ ₹{taxResult.cess.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-300 font-semibold text-lg">Total Tax Liability</span>
                  <span className="font-bold text-3xl text-green-400">₹{taxResult.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {taxResult.tax === 0 && (taxIncome <= 500000 && taxIncome > 250000) && (
                  <p className="text-xs text-green-400 bg-green-400/10 p-2 rounded text-center mt-2">Full rebate applicable under Sec 87A</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CACalculator;
