import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Header } from "@/components/shared/Header";
import { Starfield } from "@/components/magicui/starfield";

export default function ResetPasswordPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <Starfield
                starCount={150}
                duration={25}
                starColor="#ffffff"
                starSize={[1, 4]}
                className="dark:opacity-100 opacity-0"
            />
            <Header showSignIn={false} />
            <div className="relative z-10 max-w-md w-full">
                <ResetPasswordForm />
            </div>
        </div>
    );
}
