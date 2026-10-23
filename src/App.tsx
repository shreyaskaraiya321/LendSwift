import { Badge } from '@/components/common/Badge';
import { WizardContainer } from '@/components/wizard/WizardContainer';
import { RBI_STATUTORY_DISCLOSURE } from '@/constants/loanConstants';

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900">
      {/* Top Regulatory Header */}
      <header className="bg-primary-950 text-neutral-300 py-2 border-b border-primary-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-success-500 font-semibold">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              RBI Registered NBFC-ICC
            </span>
            <span className="text-neutral-500 hidden sm:inline">|</span>
            <span className="text-neutral-400 hidden sm:inline">
              {RBI_STATUTORY_DISCLOSURE.registrationNumber}
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              256-Bit TLS Encryption
            </span>
            <span>Support: 1800-209-4000</span>
          </div>
        </div>
      </header>

      {/* Main LendSwift Brand Navigation Bar */}
      <div className="bg-white border-b border-neutral-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-fintech bg-primary-800 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              LS
            </div>
            <div>
              <span className="text-xl font-black text-primary-900 tracking-tight flex items-center gap-1">
                Lend<span className="text-primary-700">Swift</span>
              </span>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">
                Fast-Track Digital Lending
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="primary" size="md" className="hidden sm:inline-flex">
              Digital Personal Loan
            </Badge>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-neutral-500 block">Instant Sanction</span>
              <span className="text-xs font-bold text-success-600">Up to ₹10 Lakhs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Step Form Engine */}
      <main className="flex-1">
        <WizardContainer />
      </main>

      {/* RBI Statutory Footer */}
      <footer className="bg-white border-t border-neutral-200 text-neutral-600 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-neutral-100">
            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Corporate Identity</h4>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                {RBI_STATUTORY_DISCLOSURE.nbfcName}
                <br />
                {RBI_STATUTORY_DISCLOSURE.category}
                <br />
                {RBI_STATUTORY_DISCLOSURE.registrationNumber}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Grievance Redressal Officer</h4>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                {RBI_STATUTORY_DISCLOSURE.complianceNodalOfficer}
                <br />
                Email: {RBI_STATUTORY_DISCLOSURE.grievanceEmail}
                <br />
                Helpline: {RBI_STATUTORY_DISCLOSURE.nodalContact}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-neutral-900 mb-2">Registered Corporate Office</h4>
              <p className="text-[11px] leading-relaxed text-neutral-500">
                {RBI_STATUTORY_DISCLOSURE.registeredOffice}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-neutral-400">
            <p>© {new Date().getFullYear()} LendSwift Financial Services India Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#fair-practices" className="hover:text-primary-800 underline">
                Fair Practices Code
              </a>
              <a href="#privacy" className="hover:text-primary-800 underline">
                Data Privacy Policy
              </a>
              <a href="#terms" className="hover:text-primary-800 underline">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
