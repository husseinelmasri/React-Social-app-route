import axios from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

export async function getAllPosts() {
  const data = await axios.get(`${baseUrl}/posts?limit=10`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('userToken')}`,
    },
  });

  return data;
}
