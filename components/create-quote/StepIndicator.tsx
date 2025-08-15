'use client';

import { Check } from 'lucide-react';
import type { FC } from 'react';

// --- Tipe Data untuk Props ---
interface StepIndicatorProps {
    activeStep: number;
    setActiveStep: (step: number) => void;
}

// --- Komponen Indikator Tahap ---
const StepIndicator: FC<StepIndicatorProps> = ({ activeStep, setActiveStep }) => {
    const steps = [
        { number: 1, label: "Job Selection" },
        { number: 2, label: "Customer Detail" },
        { number: 3, label: "Product Spec" },
        { number: 4, label: "Operational" },
        { number: 5, label: "Quotation" },
    ];

    return (
        <div className="grid grid-cols-5 w-full bg-transparent gap-4">
            {steps.map((step) => {
                const isActive = step.number === activeStep;
                const isCompleted = step.number < activeStep;
                
                return (
                    <button 
                        key={step.number}
                        onClick={() => isCompleted && setActiveStep(step.number)}
                        disabled={!isCompleted}
                        className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                            isActive ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        } ${isCompleted ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
                    >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                            isCompleted 
                                ? "bg-green-500 text-white" 
                                : isActive 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-200 text-gray-700"
                        }`}>
                            {isCompleted ? <Check className="h-5 w-5" /> : step.number}
                        </div>
                        <p className="text-xs md:text-sm text-center font-medium">{step.label}</p>
                    </button>
                );
            })}
        </div>
    );
};

export default StepIndicator;
