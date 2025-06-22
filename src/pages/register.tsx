import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode="register" />
      </div>
    </div>
  );
} 