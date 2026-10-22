import { Button, Input, Spinner } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { TextField, FieldError } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth.service';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useContext } from 'react';
import { TokenContext } from '../../components/context/tokenContext';
import { loginSchema } from '../../lib/Schemas/Auth.schema';

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const tokenCtx = useContext(TokenContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchemaType>({
    mode: 'all',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function submitData(values: LoginSchemaType) {
    try {
      const response = await loginUser(values);
      const token = response.data.data.token;

      localStorage.setItem('userToken', token);
      tokenCtx?.setToken(token);

      toast.success(response.data.message, {
        duration: 5000,
        position: 'top-right',
      });

      navigate('/feed', { replace: true });
    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Something went wrong', {
          duration: 5000,
          position: 'top-right',
        });
      }
    }
  }

  return (
    <main>
      <section>
        <h1 className="text-4xl font-bold text-main">Log in to Route Posts</h1>
        <p>Log in and continue your social journey</p>

        <form className="space-y-5 pt-5" onSubmit={handleSubmit(submitData)}>
          <TextField
            aria-label="email"
            className="w-full"
            isInvalid={Boolean(errors.email)}>
            <Input
              {...register('email')}
              aria-label="email"
              type="email"
              className="w-full rounded-md"
              placeholder="email"
            />
            <FieldError>{errors.email?.message}</FieldError>
          </TextField>

          <TextField
            aria-label="password"
            className="w-full"
            isInvalid={Boolean(errors.password)}>
            <Input
              {...register('password')}
              aria-label="password"
              type="password"
              className="w-full rounded-md"
              placeholder="password"
            />
            <FieldError>{errors.password?.message}</FieldError>
          </TextField>

          <Button type="submit" className="bg-main rounded-md w-full">
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner />
                <p>Loading</p>
              </div>
            ) : (
              'LogIn'
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}
