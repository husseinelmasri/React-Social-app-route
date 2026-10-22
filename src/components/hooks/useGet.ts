import axios from 'axios';
import { useEffect, useState } from 'react';

export default function useGet<T = unknown>(apilink: string | null) {
  const [myData, setmyData] = useState<T | null>(null);

  useEffect(() => {
    if (!apilink) return;

    let cancelled = false;

    async function getData(apilink: string) {
      try {
        const { data } = await axios.get<T>(apilink, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`,
          },
        });
        if (!cancelled) setmyData(data);
      } catch (error) {
        console.log(error);
      }
    }
    getData(apilink);

    return () => {
      cancelled = true;
    };
  }, [apilink]);

  return myData;
}
