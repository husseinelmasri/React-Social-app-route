import axios from 'axios';
import type {
  RegisterSchemaType,
  LoginSchemaType,
} from '../lib/Schemas/Auth.schema';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function registerUser(formData: RegisterSchemaType) {
  const data = await axios.post(`${BASE_URL}/users/signup`, formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
}

export async function loginUser(formData: LoginSchemaType) {
  const data = await axios.post(`${BASE_URL}/users/signin`, formData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return data;
}

export async function changePasswordUser(formData: {
  currentPassword: string;
  newPassword: string;
}) {
  const token = localStorage.getItem('userToken');

  // ✅ EXACT payload the backend wants based on the error
  const payload = {
    password: formData.currentPassword,
    newPassword: formData.newPassword,
  };

  try {
    const data = await axios.patch(
      `${BASE_URL}/users/change-password`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('SERVER REJECTED:', error.response?.data);
    }
    throw error;
  }
}
