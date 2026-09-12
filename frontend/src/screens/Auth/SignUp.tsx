import { AuthForm } from './AuthForm';

export function SignUp() {
  return (
    <AuthForm
      tagline="Create an account to see your credit score."
      submitLabel="Continue"
      socialVerb="Sign up"
      minPasswordLength={8}
      passwordPlaceholder="min. 8 characters"
      switchText="Already have an account?"
      switchLinkLabel="Log in"
      switchTo="/login"
      isSignUp
    />
  );
}
