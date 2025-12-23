import { useState } from "react";
import { Header } from "@/components/layout";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import TextType from "@/components/ui/TextType";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="bg-[#101e22] min-h-screen">
      <Header />
      {isLogin ? (
        <div className="flex flex-col justify-center items-center">
          <div className="w-full max-w-150 mx-auto px-4 sm:px-6 font-bold primary-color text-2xl sm:text-3xl md:text-4xl pt-20 sm:pt-30 md:pt-45">
            &gt;
            <TextType
              key="login"
              text={["./login_user"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="font-bold primary-color text-2xl sm:text-3xl md:text-4xl"
            />
          </div>
          <p className="font-JetBrains-Mono content-color w-full max-w-150 text-sm sm:text-md mx-auto mt-2 px-4 sm:px-6 text-center">
            Access your account to continue
          </p>
          <div className="w-full px-4 sm:px-6">
            <LoginForm />
          </div>
          <div className="w-full max-w-120 mt-5 font-JetBrains-Mono mb-6 cursor-pointer mx-auto px-4 sm:px-6 group">
            <button onClick={() => setIsLogin(false)} className="w-full">
              <p className="text-[#6c7280] group-hover:text-[#faf506] transition-colors duration-200 w-full text-sm sm:text-base text-center">
                // Not a member? <span className="underline">Register here</span>
              </p>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center">
          <div className="w-full max-w-150 mx-auto px-4 sm:px-6 font-bold primary-color text-2xl sm:text-3xl md:text-4xl pt-20 sm:pt-30 md:pt-45">
            &gt;
            <TextType
              key="register"
              text={["./register_new_user"]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="font-bold primary-color text-2xl sm:text-3xl md:text-4xl"
            />
          </div>
          <p className="font-JetBrains-Mono content-color w-full max-w-150 text-sm sm:text-md mx-auto mt-2 px-4 sm:px-6 text-center">
            Initialize your profile to join the competition
          </p>
          <div className="w-full px-4 sm:px-6">
            <RegisterForm />
          </div>
          <div className="w-full max-w-120 mt-5 font-JetBrains-Mono mb-6 cursor-pointer mx-auto px-4 sm:px-6 group">
            <button onClick={() => setIsLogin(true)} className="w-full">
              <p className="text-[#6c7280] group-hover:text-[#faf506] transition-colors duration-200 w-full text-sm sm:text-base text-center">
                // Already a member? <span className="underline">Login here</span>
              </p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
