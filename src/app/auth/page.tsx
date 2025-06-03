import { AuthPage } from "@/components/auth/auth-page";
import { AuthProvider } from "@/hooks/use-auth";

const page = () => {
  return (
    <AuthProvider>
      <AuthPage />
    </AuthProvider>
  );
};

export default page;
