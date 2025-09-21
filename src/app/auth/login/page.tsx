import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Header } from "@/components/shared/Header";
import { Starfield } from "@/components/magicui/starfield";

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                    <Starfield
                        starCount={150}
                        duration={25}
                        starColor="#ffffff"
                        starSize={[1, 4]}
                        className="dark:opacity-100 opacity-0"
                    />
                    <div className="relative z-10 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Loading...
                        </p>
                    </div>
                </div>
            }
        >
            <div className="relative min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 pt-32 sm:pt-12">
                <Starfield
                    starCount={150}
                    duration={25}
                    starColor="#ffffff"
                    starSize={[1, 4]}
                    className="dark:opacity-100 opacity-0"
                />
                <Header showSignIn={false} />
                <div className="relative z-10 max-w-md w-full">
                    <LoginForm />
                </div>
            </div>
        </Suspense>
    );
}
