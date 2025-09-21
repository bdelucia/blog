import { SignupForm } from "@/components/auth/signup-form";
import { Header } from "@/components/shared/Header";
import { Starfield } from "@/components/magicui/starfield";

export default function SignUpPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 pt-20 sm:pt-12">
            <Starfield
                starCount={150}
                duration={25}
                starColor="#ffffff"
                starSize={[1, 4]}
                className="dark:opacity-100 opacity-0"
            />
            <Header showSignIn={false} />
            <div className="relative z-10 max-w-md w-full">
                <SignupForm />
            </div>
        </div>
    );
}
