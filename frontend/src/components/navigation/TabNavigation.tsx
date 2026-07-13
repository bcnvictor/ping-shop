import React from "react";
import type { Tab } from "../../types/navigation.types";
import './TabNavigation.css';

interface TabNavigationProps {
    tabs: Tab[];
    activeTab: number;
    setActiveTab: (tabId: number) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    setActiveTab
}) => {
    // Note: on a plus besoin de useUser ici vu qu'on filtre les tabs avec le Header component.
    return (
        <nav className="tab-navigation">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? 'active-tab-button' : 'tab-button'}
                >
                    <span>{tab.icon}</span>
                    <span>{tab.name}</span>
                </button>
            ))}
        </nav>
    );
};