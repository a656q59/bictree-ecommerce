export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  accessToken: string;
  user: AuthUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};
