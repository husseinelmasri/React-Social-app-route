import { NavLink, Outlet } from 'react-router-dom';
import AuthIntro from '../components/Authintro/AuthIntro';

export default function AuthLayout() {
  return (
    <>
      <main className="bg-sec min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1 flex justify-center md:justify-end">
              <AuthIntro />
            </div>

            <div className="order-1 md:order-2 flex flex-col items-center md:items-start pt-15 gap-6">
              <div className="inline-flex justify-between gap-4 bg-gray-300 px-4 py-2 rounded-md">
                <NavLink
                  to="login"
                  className={({ isActive }) =>
                    `px-3 py-1 rounded-md transition-colors ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-black/70 hover:text-black'
                    }`
                  }>
                  Login
                </NavLink>

                <NavLink
                  to="register"
                  className={({ isActive }) =>
                    `px-3 py-1 rounded-md transition-colors ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-black/70 hover:text-black'
                    }`
                  }>
                  Register
                </NavLink>
              </div>

              <div className="w-full max-w-md">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
