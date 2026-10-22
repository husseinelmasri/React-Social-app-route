import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-sec">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-4">
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
