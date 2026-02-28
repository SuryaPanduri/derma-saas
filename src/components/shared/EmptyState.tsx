export const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
    <h3 className="text-base font-semibold text-slate-700">{title}</h3>
    <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
  </div>
);
