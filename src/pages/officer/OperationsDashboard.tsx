import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function OperationsDashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#EFF6F7] px-6 text-[#123B5C]">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#123B5C] text-[#42B99A]">
          <ShieldAlert size={26} />
        </div>
        <span className="inline-block rounded-md bg-[#EFF6F7] px-3 py-1 text-[11px] font-semibold text-[#1D5F8A]">
          FIELD OPERATIONS
        </span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#123B5C]">
          Operations Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Field Officer operations interface is currently under active development.
        </p>

        <div className="mt-6 border-t border-slate-100 pt-6">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#1D5F8A] hover:underline"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}

