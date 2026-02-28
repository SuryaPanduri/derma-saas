interface SidebarProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const Sidebar = ({ tabs, activeTab, onChange }: SidebarProps) => (
  <aside className="h-full w-full">
    <nav className="h-full space-y-4 rounded-2xl border border-[#d5e4e7] bg-white p-5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`w-full rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 ease-in-out ${
            activeTab === tab
              ? 'border-[#0f4a52] bg-[#0f4a52] text-white'
              : 'border-[#d5e4e7] bg-white text-[#12353a] hover:bg-[#e7eef0]'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  </aside>
);
