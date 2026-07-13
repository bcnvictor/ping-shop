import React from "react";

interface PageLayoutProps {
    children: React.ReactNode;
    backgroundColor?: string;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
    children,
    backgroundColor = '#003049'
}) => {
    return (
        <div className="page" style={{ backgroundColor }}>
            {children}    
        </div>
    );
};