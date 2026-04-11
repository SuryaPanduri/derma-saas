interface SidebarProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
}

export const Sidebar = ({ tabs, activeTab, onChange }: SidebarProps) => (
  <aside className="h-full w-full">
    <nav className="h-full space-y-4 rounded-2xl border border-[#D4C8BC] bg-white p-5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`w-full rounded-full border px-4 py-2.5 text-left text-sm font-semibold transition-all duration-300 ease-in-out ${
            activeTab === tab
              ? 'border-[#8A6F5F] bg-[#8A6F5F] text-white'
              : 'border-[#D4C8BC] bg-white text-[#191919] hover:bg-[#F5F0EA]'
          }`}
        >
          {tab}
        </button>
      ))}
    </nav>
  </aside>
);
