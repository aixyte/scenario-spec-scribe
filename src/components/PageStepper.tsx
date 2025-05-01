
import React from "react";

interface PageStepperProps {
  currentStep: number;
  totalSteps: number;
}

const PageStepper = ({ currentStep, totalSteps }: PageStepperProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= step
                ? "bg-primary text-primary-foreground"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step}
          </div>
          {step < totalSteps && (
            <div className="h-1 flex-1 bg-gray-200">
              <div
                className={`h-full bg-primary ${
                  currentStep >= step + 1 ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PageStepper;
