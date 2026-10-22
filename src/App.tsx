import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import AuthLayout from './Layouts/AuthLayout';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import MainLayout from './Layouts/MainLayout';
import Newsfeed from './pages/Newsfeed/Newsfeed';
import Profile from './pages/Profile/Profile';
import Notification from './pages/Notification/Notification';
import Notfound from './pages/Notfound/Notfound';
import { Toaster } from 'react-hot-toast';
import AppProtectedRoutes from './components/ProtectedRoutes/AppProtectedRoutes';
import AuthProtectedRoutes from './components/ProtectedRoutes/AuthProtectedRoutes';
import ChangePassword from './pages/ChangePassword/ChangePassword';
import PostDetails from './components/Post/PostDetails';

const routes = createBrowserRouter([
  {
    path: '/auth',
    element: (
      <AuthProtectedRoutes>
        <AuthLayout />
      </AuthProtectedRoutes>
    ),
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forget-password', element: <ChangePassword /> },
    ],
  },
  {
    path: '/',
    element: (
      <AppProtectedRoutes>
        <MainLayout />
      </AppProtectedRoutes>
    ),
    children: [
      { index: true, element: <Navigate to="/feed" replace /> },
      { path: 'feed', element: <Newsfeed /> },
      { path: 'profile', element: <Profile /> },
      { path: 'notification', element: <Notification /> },
      { path: 'postDetails/:id', element: <PostDetails /> },
      { path: 'settings/change-password', element: <ChangePassword /> },
      { path: '*', element: <Notfound /> },
    ],
  },
]);

function App() {
  return (
    <>
      <Toaster />

      <RouterProvider router={routes} />
    </>
  );
}

export default App;
