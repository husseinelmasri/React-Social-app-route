import { useState, useContext } from 'react';
import { Input, Spinner } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import {
  changePasswordSchema,
  type ChangePasswordSchemaType,
} from '../../lib/Schemas/Auth.schema';
import { changePasswordUser } from '../../services/auth.service';
import { TokenContext } from '../../components/context/tokenContext';

export default function ChangePassword() {
  const navigate = useNavigate();
  const tokenCtx = useContext(TokenContext);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordSchemaType>({
    mode: 'all',
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      rePassword: '',
    },
  });

  async function submitData(values: ChangePasswordSchemaType) {
    setApiError(null);
    setApiSuccess(null);

    const token = localStorage.getItem('userToken');
    if (!token) {
      setApiError('You must be logged in to change your password.');
      return;
    }

    try {
      const response = await changePasswordUser({
        currentPassword: values.currentPassword,
        newPassword: values.password,
      });

      setApiSuccess(
        response.data.message || 'Password updated! Please log in again.',
      );
      reset();

      setTimeout(() => {
        localStorage.removeItem('userToken');
        tokenCtx?.setToken(null);
        navigate('/auth/login', { replace: true });
      }, 3000);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setApiError(error.response?.data?.message ?? 'Something went wrong');
      } else {
        setApiError('Something went wrong');
      }
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
        <div className="mb-8 flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-600">
            <KeyRound size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Change Password
            </h1>
            <p className="text-sm text-gray-500">
              Keep your account secure by using a strong password.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(submitData)} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Current password
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Input
                {...register('currentPassword')}
                type="password"
                placeholder="Enter current password"
                className="bg-transparent border-none shadow-none focus:ring-0 text-sm w-full"
              />
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-500">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              New password
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Input
                {...register('password')}
                type="password"
                placeholder="Enter new password"
                className="bg-transparent border-none shadow-none focus:ring-0 text-sm w-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              At least 8 characters with uppercase, lowercase, number, and
              special character.
            </p>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Confirm new password
            </label>
            <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <Input
                {...register('rePassword')}
                type="password"
                placeholder="Re-enter new password"
                className="bg-transparent border-none shadow-none focus:ring-0 text-sm w-full"
              />
            </div>
            {errors.rePassword && (
              <p className="text-xs text-red-500">
                {errors.rePassword.message}
              </p>
            )}
          </div>

          {apiError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {apiError}
            </div>
          )}

          {apiSuccess && (
            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600 border border-green-100">
              {apiSuccess}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center font-semibold mt-4 bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2.5 transition disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Updating...</span>
              </div>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
