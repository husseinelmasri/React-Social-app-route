import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type { userProfileType } from '../../types/user.types';
import { getMyProfile } from '../../services/profile.service';
import { TokenContext } from './tokenContext';

export type userContextType = {
  userDetails: userProfileType | null;
  setUserDetails: Dispatch<SetStateAction<userProfileType | null>>;
};

export const UserContext = createContext<userContextType | null>(null);

export default function UserContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userDetails, setUserDetails] = useState<userProfileType | null>(null);
  const token = useContext(TokenContext)?.token ?? null;

  useEffect(() => {
    if (!token) {
      setUserDetails(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const { data } = await getMyProfile();
        if (!cancelled) setUserDetails(data.data.user);
      } catch (err) {
        console.log('Failed to load profile', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <UserContext.Provider value={{ userDetails, setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
}
