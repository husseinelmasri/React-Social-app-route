import { Button, Input, Spinner } from '@heroui/react';
import { ListBox, Select } from '@heroui/react';
import { Controller, useForm } from 'react-hook-form';
import { TextField, FieldError } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from './../../lib/Schemas/Auth.schema';
import { useNavigate, type Register } from 'react-router-dom';
import { registerUser } from '../../services/auth.service';
import axios from 'axios';

import { toast } from 'react-hot-toast';
import { z } from 'zod';
import { useState } from 'react';

type RegisterSchemaType = z.infer<typeof registerSchema>;

export default function Register() {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchemaType>({
    mode: 'all',
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      dateOfBirth: '',
      gender: undefined,
      password: '',
      rePassword: '',
    },
  });

  async function submitData(values: RegisterSchemaType) {
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const response = await registerUser(values);
      console.log(response);

      console.log(response.data.message);
      // setSuccessMessage(response.data.message);
      toast.success(response.data.message, {
        duration: 5000,
        position: 'top-right',
      });

      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      console.log(error);

      if (axios.isAxiosError(error)) {
        console.log(error.response?.data.message);
        // setErrorMessage(error.response?.data.message);
        toast.error(error.response?.data.message, {
          duration: 5000,
          position: 'top-right',
        });
      }
    }
  }
  return (
    <>
      <main>
        <section className="">
          <h1 className="text-4xl font-bold text-bold text-main">
            Create a new account
          </h1>
          <p>Its Quick and easy</p>
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          <form className="space-y-5 pt-5" onSubmit={handleSubmit(submitData)}>
            <TextField
              aria-label="name"
              className="w-full"
              isInvalid={Boolean(errors.name)}>
              <Input
                {...register('name')}
                aria-label="FullName"
                className="w-full rounded-md"
                placeholder="Full Name"
              />
              <FieldError>{errors.name?.message}</FieldError>
            </TextField>
            <TextField
              aria-label="username"
              className="w-full"
              isInvalid={Boolean(errors.username)}>
              <Input
                {...register('username')}
                aria-label="UserName"
                className="w-full rounded-md"
                placeholder="UserName"
              />
              <FieldError>{errors.username?.message}</FieldError>
            </TextField>

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
              aria-label="gender"
              className="w-full"
              isInvalid={Boolean(errors.gender)}>
              <Controller
                name="gender"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    isInvalid={!!fieldState.error}
                    aria-label="gender">
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover>
                      <ListBox>
                        <ListBox.Item id="male" textValue="male">
                          male <ListBox.ItemIndicator />
                        </ListBox.Item>
                        <ListBox.Item id="female" textValue="female">
                          female <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              />
              <FieldError>{errors.gender?.message}</FieldError>
            </TextField>

            <TextField
              aria-label="dateOfBirth"
              className="w-full"
              isInvalid={Boolean(errors.dateOfBirth)}>
              <Input
                {...register('dateOfBirth')}
                aria-label="Date"
                type="date"
                className="w-full rounded-md"
              />
              <FieldError>{errors.dateOfBirth?.message}</FieldError>
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

            <TextField
              aria-label="repassword"
              className="w-full"
              isInvalid={Boolean(errors.rePassword)}>
              <Input
                {...register('rePassword')}
                aria-label="password"
                type="password"
                className="w-full rounded-md"
                placeholder="confirm password"
              />
              <FieldError>{errors.rePassword?.message}</FieldError>
            </TextField>

            <Button type="submit" className="bg-main rounded-md w-full">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner />
                  <p>Loading</p>
                </div>
              ) : (
                'Create New Account'
              )}
            </Button>
          </form>
        </section>
      </main>
    </>
  );
}
