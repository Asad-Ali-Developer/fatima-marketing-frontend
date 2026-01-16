import { FC, ReactNode } from "react";
import Navbar from "./Navbar";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: FC<MainLayoutProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default MainLayout;
