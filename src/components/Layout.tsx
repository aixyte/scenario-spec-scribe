
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const Layout = ({ children, title, subtitle }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Make Scenario to API (OpenAPI)</h1>
          {subtitle && <p className="text-gray-500 mt-1">Convert make.com scenarios into OpenAPI V3 Specs to run scenarios.</p>}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </main>
      
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Make Scenario to OpenAPI Converter © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
