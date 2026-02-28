export const Loader = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex items-center gap-2 text-sm text-slate-600">
    <span className="h-2.5 w-2.5 animate-ping rounded-full bg-teal-500" />
    {label}
  </div>
);
