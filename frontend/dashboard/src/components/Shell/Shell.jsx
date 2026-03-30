import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomBar from './BottomBar';
import './Shell.css';

export default function Shell() {
  return (
    <div className="shell">
      <Sidebar />
      <BottomBar />
      <main className="shell-main">
        <Outlet />
      </main>
    </div>
  );
}
