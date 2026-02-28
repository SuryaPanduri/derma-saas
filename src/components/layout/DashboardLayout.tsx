import type { ReactNode } from 'react';
import { Header } from './Header';

export const DashboardLayout = ({
  children,
  hideHeader = false,
  fullBleed = false
}: {
  children: ReactNode;
  hideHeader?: boolean;
  fullBleed?: boolean;
}) => (
  <div className="min-h-screen bg-[#eaf0f2]">
    {!hideHeader ? <Header /> : null}
    <main className={fullBleed ? 'min-h-screen p-0' : 'mx-auto min-h-screen w-full max-w-none px-6 py-10 lg:px-10'}>{children}</main>
  </div>
);
