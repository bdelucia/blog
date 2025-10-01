import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Header } from "@/components/shared/Header";
import { Starfield } from "@/components/magicui/starfield";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

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
            <div className="absolute inset-0 pointer-events-none dark:hidden">
                <FlickeringGrid
                    className="relative inset-0 z-0"
                    squareSize={4}
                    gridGap={6}
                    color="#60A5FA"
                    maxOpacity={0.3}
                    flickerChance={0.1}
                />
            </div>
            <Header showSignIn={false} />
            <div className="relative z-10 max-w-md w-full">
                <ResetPasswordForm />
            </div>
        </div>
    );
}
