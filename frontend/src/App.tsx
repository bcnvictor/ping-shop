import { useState } from 'react';
import { Header } from './components/layout/Header';
import { PageLayout } from './components/layout/PageLayout';
import { Shop } from './pages/Shop';
import { Stocks } from './pages/Stocks';
import { Stats } from './pages/Stats';
import { Logs } from './pages/Logs';
import { CartProvider } from './contexts/CartContext';
import type { Tab } from './types/navigation.types';
import './styles/variables.css';
import './App.css';
import { UserProvider } from './contexts/UserContext';
import { StockAlertsProvider } from './contexts/StockAlertProvider';
import { useStockAlerts } from './contexts/StockAlertProvider';


function AppContent() {

  const [activeTab, setActiveTab] = useState(0);
  const { hideAlerts } = useStockAlerts();
  const [alertsHaveBeenShown, setAlertsHaveBeenShown] = useState(false);


const tabs: Tab[] = [
  
    {id: 0, name: 'Shop', icon: '🛒', minRole: 'user'},
    {id: 1, name: 'Stocks', icon: '📦', minRole: 'seller'},
    {id: 2, name: 'Stats', icon: '📈', minRole: 'seller'},
    {id: 3, name: 'Logs', icon: '🔔', minRole: 'admin'}
  ];

  const handleTabChange = (tabId: number) => {
    // Fermer les alertes quand on change de page
    if (activeTab === 0 || tabId !== 0) {
      setAlertsHaveBeenShown(true);
    }
    hideAlerts();
    setActiveTab(tabId);
  };
  
  const render = () => {
    switch (activeTab) {
      case 0: return <Shop alertsHaveBeenShown={alertsHaveBeenShown} setAlertsHaveBeenShown={setAlertsHaveBeenShown} />;
      case 1: return <Stocks/>;
      case 2: return <Stats/>;
      case 3: return <Logs/>;
      default: return <Shop alertsHaveBeenShown={alertsHaveBeenShown} setAlertsHaveBeenShown={setAlertsHaveBeenShown} />;
    }
  };

  return (
    <UserProvider>
      <CartProvider>
        <StockAlertsProvider>
        <PageLayout>
          <Header
            logoSrc="https://s3.cri.epita.fr/acu-scrooge/scrooge/img/scrooge.png"
            tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        {render()}
      </PageLayout>
      </StockAlertsProvider>
    </CartProvider>
    </UserProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <StockAlertsProvider>
          <AppContent />
        </StockAlertsProvider>
      </CartProvider>
    </UserProvider>
  );
}


export default App;