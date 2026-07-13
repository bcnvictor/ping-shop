import React, { useState } from 'react';
import { Logo } from '../common/Logo';
import { TabNavigation } from '../navigation/TabNavigation';
import type { Tab } from '../../types/navigation.types';
import { User as UserLogo, LogOut, Image, ShoppingCart, UserRoundPlus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { CartModal } from '../cart/CartModal';
import { showLogPrompt, showRegisterPrompt } from '../../utils/login';
import { useUser } from '../../contexts/UserContext';
import { canViewTab } from '../../utils/permissions';
import { resetShopToMain } from '../../pages/Shop';


import './Header.css';

interface HeaderProps {
  logoSrc: string;
  tabs: Tab[];
  activeTab: number;
  onTabChange: (tabId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  logoSrc, 
  tabs, 
  activeTab, 
  onTabChange 
}) => {
  const {user, isLoggedIn, login, logout, updateUser} = useUser();
  const [ppSrc, setPpSrc] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartContext = useCart();
  const getTotalItems = cartContext?.getTotalItems ?? (() => 0);
  
  const visibleTabs = tabs.filter(tab => canViewTab(user?.role, tab.minRole));
  
  const handleProfilePicture = () => {
    updateUser({avatar: ppSrc});
    setPpSrc('');
  };

  function handleLogout() {
    logout();
  }

  async function handleLogin() {
    const userInfo = await showLogPrompt();
    if (userInfo) {
      login(userInfo.user, userInfo.token);
    }
  }

  async function handleRegister() {
    const userInfo = await showRegisterPrompt();
    if(userInfo) {
      login(userInfo.user, userInfo.token);
    }
  }

  const handleTabChange = (tabId: number) => {
    const isValidTab = visibleTabs.some(tab => tab.id === tabId);
    if (isValidTab) {
      if (tabId === 0 && activeTab === 0) {
        resetShopToMain();
      } else {
        onTabChange(tabId);
      }
    } else {
      // Si tab invalide, redirecte au premier tab valide dispo
      if (visibleTabs.length > 0) {
        onTabChange(visibleTabs[0].id);
      }
    }
  };

  return (
    <header className='header'>
      <Logo src={logoSrc} alt="Logo Scrooge" />
      
      <TabNavigation 
        tabs={visibleTabs}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
      
      <div className='user-container'>
        {isLoggedIn ? (
          <>
            <div className="header-actions">
              {user?.avatar === "" ? <UserLogo size={64} color="white" /> : <img src={user?.avatar} style={{width:'64px', height:'64px', objectFit:'cover', borderRadius: '50%'}}/>}
            </div>
            <div className="dropdown">
              <div className="dropdown-item" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={16} />
                <span>View Cart ({getTotalItems()})</span>
              </div>
              <div className="dropdown-item" >
                <Image size={16} />
                <span onClick={handleProfilePicture}>Change profil picture</span>
                <input 
                  type="text"
                  value={ppSrc}
                  onChange={(e) => setPpSrc(e.target.value)}
                  placeholder="Profile picture URL"
                />
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div> 
          </>
        ) : (
          <div className='log-buttons'>
            <button className='login-button' onClick={handleLogin}> <UserLogo size={16}/> Login</button>
            <button className='register-button' onClick={handleRegister}> <UserRoundPlus size={16}/> Register</button>
          </div>
        )}
      </div>
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};