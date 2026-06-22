import React from 'react';
import { Clock, RefreshCcw, MessageSquare, ShieldCheck, UserCircle } from 'lucide-react';

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-[2rem] shadow-sm border border-emerald-100 p-10 text-center relative overflow-hidden">
        
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-emerald-50 rounded-full blur-3xl"></div>

        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-200 rounded-full animate-pulse blur-md opacity-40"></div>
            
            <div className="relative bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center border border-emerald-100 transform rotate-3">
              <Clock size={40} className="text-emerald-600 -rotate-3" />
            </div>

            <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-sm border border-emerald-50">
                <ShieldCheck size={20} className="text-emerald-500" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
          Application Submitted!
        </h1>
        <p className="text-slate-500 leading-relaxed mb-8">
          Your seller account is currently under review by our team. 
          You will receive an email notification once your application has been approved.
        </p>

        <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-emerald-700">
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-semibold text-sm uppercase tracking-wider">Status: Under Review</span>
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.reload()} 
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-200 active:scale-95"
            >
              <RefreshCcw size={18} />
              Refresh Status
            </button>
            
            <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 text-slate-600 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95">
              <MessageSquare size={18} />
              Contact Support
            </button>
          </div>

          <button
            onClick={() => window.location.href = '/profile'}
            className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-3.5 px-6 rounded-xl transition-all duration-300 active:scale-95 border border-slate-100">
            <UserCircle size={20} />
            Go to User Profile
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-50">
            <p className="text-xs text-slate-400">
                This process usually takes about 24 hours. For assistance, reach out to <span className="text-emerald-600 font-medium">support@yourstore.com</span>
            </p>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;