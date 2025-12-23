import { LockKeyhole, LogIn, UserRound } from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import GoogleLogo from "@/assets/Google.png";

export const LoginForm = () => {
  return (
    <div className="border rounded-lg border-gray-800 border-t-(--primary-color) border-t-2 bg-[#18262b] max-w-90 xl:max-w-130 2xl:max-w-130 md:max-w-130 p-12 mx-auto">
      <div>
        <div className="w-full text-center mx-auto">
          <h1 className="font-bold text-white font-Spline-Sans text-3xl">
            Welcome Back
          </h1>
          <p className="content-color">Ready to crush some more problems?</p>
        </div>

        <Divider text="OR" className="mt-6 mb-5" />

        <div>
          <form className="font-JetBrains-Mono">
            <FormField
              label="EMAIL ADDRESS"
              icon={UserRound}
              type="email"
              placeholder="std::cin >> email"
            />
            
            <FormField
              label="PASSWORD"
              icon={LockKeyhole}
              type="password"
              placeholder="******"
            />
          </form>
        </div>

        <Button variant="accent" className="mt-8 w-full flex gap-3">
          <LogIn />
          <h3>Log In</h3>
        </Button>

        <Divider text="OR" className="mt-5 mb-5" />

        <SocialButton icon={GoogleLogo} text="Continue with Google" />
      </div>
    </div>
  );
};
