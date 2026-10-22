import * as z from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .nonempty('name is Required')
    .min(3, 'min char 3')
    .max(10, 'max 10 charc'),

  username: z
    .string()
    .nonempty('username is Required')
    .min(3, 'min char 3')
    .max(10, 'max 10 charc'),

  email: z
    .string()
    .nonempty('Email is Required')
    .email('Enter a valid email address'),

  dateOfBirth: z
    .string()
    .nonempty('Date of Birth is Required')
    .refine((date) => !Number.isNaN(new Date(date).getTime()), {
      message: 'Invalid date',
    })
    .refine(
      (date) => {
        const dob = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        return age >= 18;
      },
      { message: 'You must be at least 18 years old' },
    ),

  gender: z.enum(['male', 'female'], {
    required_error: 'Gender is required',
  }),

  password: z.string().nonempty('password is Required'),

  rePassword: z
    .string()
    .nonempty('password is Required')
    .min(8, 'min char 8')
    .max(20, 'max 20 charc'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .nonempty('Email is Required')
    .email('Enter a valid email address'),

  password: z.string().nonempty('password is Required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(20, 'Password must be at most 20 characters'),
    rePassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'],
  });

export type ChangePasswordSchemaType = z.infer<typeof changePasswordSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
