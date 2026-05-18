
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Landmark, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export const GenerateNOC: React.FC = () => {
  const navigate = useNavigate();

  const nocTypes = [
    {
      id: 'PRE_SALE',
      label: 'Pre-Sale Deed NOC',
      description: 'Required before property registration process',
      path: '/add-pre-sale-noc',
      icon: <FileText className="text-orange-500" size={24} />
    },
    {
      id: 'POST_SALE',
      label: 'Post-Sale NOC',
      description: 'Issued after successful registration of property',
      path: '/add-post-sale-noc',
      icon: <FileText className="text-green-500" size={24} />
    },
    {
      id: 'LOAN',
      label: 'Loan NOC',
      description: 'For bank loan clearance and processing',
      path: '/add-loan-noc',
      icon: <Landmark className="text-indigo-500" size={24} />,
      disabled: false
    },
    {
      id: 'POST_JOB',
      label: 'Post-Job NOC',
      description: 'For staff and contractor completion',
      path: '/add-post-job-noc',
      icon: <Users className="text-blue-500" size={24} />,
      disabled: false
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-spiritual-maroon mb-2">No Objection Certificates</h1>
        <p className="text-slate-500">Select the type of NOC you wish to generate</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {nocTypes.map((type, index) => (
          <motion.button
            key={type.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => !type.disabled && navigate(type.path)}
            disabled={type.disabled}
            className={`
              flex items-center p-6 rounded-2xl border-2 transition-all text-left group
              ${type.disabled 
                ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                : 'bg-white border-slate-100 hover:border-brand-500 hover:shadow-xl hover:shadow-brand-100/50'
              }
            `}
          >
            <div className={`
              w-16 h-16 rounded-xl flex items-center justify-center mr-6 transition-colors
              ${type.disabled ? 'bg-slate-200' : 'bg-slate-50 group-hover:bg-brand-50'}
            `}>
              {type.icon}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${type.disabled ? 'text-slate-500' : 'text-slate-800'}`}>
                {type.label}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{type.description}</p>
              {type.disabled && <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">Coming Soon</p>}
            </div>
            {!type.disabled && (
              <ChevronRight className="text-slate-300 group-hover:text-brand-500 transition-colors" />
            )}
          </motion.button>
        ))}
      </div>

      <div className="mt-12 p-6 bg-brand-50 rounded-2xl border border-brand-100">
        <div className="flex items-start space-x-4">
          <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
            <FileText size={20} />
          </div>
          <div>
            <h4 className="font-bold text-brand-900 text-sm">Document Generation</h4>
            <p className="text-brand-700 text-xs mt-1 leading-relaxed">
              These NOCs are generated based on official templates. Ensure all client and property details are correctly updated in the system for accurate document generation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
