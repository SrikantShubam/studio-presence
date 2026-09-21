import { useStore } from './store';
import { Sidebar, Header } from './components/Sidebar';
import { OverviewPage } from './components/OverviewPage';
import { LeadsPage, LeadDrawer, AddLeadModal } from './components/LeadsPage';
import { CalculatorPage } from './components/CalculatorPage';
import { QRCardPage } from './components/QRCardPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SettingsPage } from './components/SettingsPage';
import { ToastContainer } from './components/ui';

function PageRouter() {
  const store = useStore();

  switch (store.page) {
    case 'overview':
      return <OverviewPage />;
    case 'leads':
      return <LeadsPage />;
    case 'calculator':
      return <CalculatorPage />;
    case 'qrcard':
      return <QRCardPage />;
    case 'analytics':
      return <AnalyticsPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  const store = useStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          store.sidebarCollapsed ? 'lg:pl-[64px]' : 'lg:pl-[248px]'
        }`}
      >
        <Header />
        <main className="mx-auto max-w-[1440px] p-4 lg:p-6">
          <PageRouter />
        </main>
      </div>

      {/* Overlays */}
      <LeadDrawer />
      <AddLeadModal />
      <ToastContainer toasts={store.toasts} removeToast={store.removeToast} />
    </div>
  );
}