import { AuthForm } from './AuthForm';

export function Login() {
  return (
    <AuthForm
      tagline="Welcome back — log in to see your score."
      submitLabel="Log in"
      minPasswordLength={1}
      passwordPlaceholder="Password"
      switchText="New here?"
      switchLinkLabel="Sign up"
      switchTo="/signup"
      isSignUp={false}
    />
  );
}
