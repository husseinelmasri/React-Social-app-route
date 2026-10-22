import logo from '../../assets/route.jpg';
import { Tabs, Button, Dropdown, Label } from '@heroui/react';
import { House, User, MessageCircleMore, Settings } from 'lucide-react';

import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TokenContext } from '../context/tokenContext';
import { UserContext } from '../context/userContext';

export default function Navbar() {
  const ctx = useContext(TokenContext);
  const userCtx = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const userName = userCtx?.userDetails?.name ?? 'User';
  const userPhoto = userCtx?.userDetails?.photo;

  function logOut() {
    localStorage.removeItem('userToken');
    ctx?.setToken(null);
    userCtx?.setUserDetails(null);
    navigate('/auth', { replace: true });
  }

  const currentTab = location.pathname.startsWith('/profile')
    ? 'Profile'
    : location.pathname.startsWith('/notification')
      ? 'Notifications'
      : 'Feed';

  return (
    <nav className="bg-gray-300 py-5">
      <div className="container mx-auto flex justify-between items-center">
        <div className="nav-logo">
          <img
            src={logo}
            width={50}
            height={50}
            className="rounded-2xl"
            alt="logo"
          />
        </div>

        <div className="nav-links">
          <Tabs
            className="w-full max-w-md"
            selectedKey={currentTab}
            onSelectionChange={(key) => {
              const k = String(key);
              if (k === 'Feed') navigate('/feed');
              else if (k === 'Profile') navigate('/profile');
              else if (k === 'Notifications') navigate('/notification');
            }}>
            <Tabs.ListContainer>
              <Tabs.List aria-label="Options">
                <Tabs.Tab id="Feed" className="flex gap-2">
                  <House /> Feed <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="Profile" className="flex gap-2">
                  <User /> Profile <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="Notifications" className="flex gap-2">
                  <MessageCircleMore /> Notifications <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>

        <div className="nav-actions">
          <Dropdown>
            <Button
              aria-label="Menu"
              variant="primary"
              className="flex items-center gap-2">
              {userPhoto && (
                <img
                  src={userPhoto}
                  alt={userName}
                  className="size-6 rounded-full object-cover"
                />
              )}
              {userName}
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => {
                  if (key === 'logout') logOut();
                  else if (key === 'profile') navigate('/profile');
                  else if (key === 'settings')
                    navigate('/settings/change-password');
                }}>
                <Dropdown.Item id="profile" textValue="Profile">
                  <User />
                  <Label>Profile</Label>
                </Dropdown.Item>
                <Dropdown.Item id="settings" textValue="Settings">
                  <Settings />
                  <Label>Settings</Label>
                </Dropdown.Item>
                <Dropdown.Item id="logout" textValue="Logout" variant="danger">
                  <Label>Logout</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
}
