export type RegisterSchema = {
  name: string;
  username: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
};
export type LoginSchema = {
  email: string;
  name: string;
};
