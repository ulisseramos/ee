import AuthForm from '../components/AuthForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="forgot" />
      </div>
    </div>
  );
} 