import React from "react";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps = {}) => {
  return (
    <div className="container mx-auto px-4 py-6">
      {children || <Outlet />}
    </div>
  );
};

export default Layout;