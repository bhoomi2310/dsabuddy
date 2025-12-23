import {
  AtSign,
  IdCard,
  IdCardLanyard,
  KeyRound,
  RotateCcwKey,
} from "lucide-react";
import { Button, Divider } from "@/components/common";
import { FormField, SocialButton } from "@/components/layout";
import GoogleLogo from "@/assets/Google.png";

export const RegisterForm = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="mt-6 sm:mt-10 w-full border-t-(--primary-color) border-t-2 max-w-120 p-4 sm:p-6 md:p-10 max-h-fit rounded-xl bg-[#18262b] border border-gray-700 mx-auto">
        <form className="mx-auto w-full flex flex-col justify-center items-center">
          <FormField
            label="Name"
            labelIcon={IdCard}
            placeholder="enter_name"
          />

          <FormField
            label="Username"
            labelIcon={IdCardLanyard}
            placeholder="enter_username"
          />

          <FormField
            label="Email Address"
            labelIcon={AtSign}
            type="email"
            placeholder="enter_email"
          />

          <div className="w-full flex flex-col sm:flex-row gap-4">
            <FormField
              label="Password"
              labelIcon={KeyRound}
              type="password"
              placeholder="******"
            />

            <FormField
              label="Confirm Password"
              labelIcon={RotateCcwKey}
              type="password"
              placeholder="******"
            />
          </div>
        </form>

        <Button variant="accent" className="w-full text-sm sm:text-base">
          &#91; Initialize Account &#93;
        </Button>

        <Divider text="OR" className="mt-5 mb-5" />

        <SocialButton icon={GoogleLogo} text="Continue with Google" />
      </div>
    </div>
  );
};
