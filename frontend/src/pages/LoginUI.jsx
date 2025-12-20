import NavBar from "@/components/ui/NavBar";
import Register from "@/components/ui/Register";
import TextType from "@/components/ui/TextType";
import { IdCard } from "lucide-react";
import React from "react";

const RegisterPage = () => {

  return (

    <div className="bg-[#101e22] flex flex-col justify-center items-center min-h-screen">
      <NavBar />
      <div className="w-full max-w-150 mx-auto px-4 sm:px-6 font-bold primary-color text-2xl sm:text-3xl md:text-4xl pt-20 sm:pt-30 md:pt-45">
        &gt;
        <TextType
          text={["./register_new_user"]}
          typingSpeed={75}
          pauseDuration={1500}
          showCursor={true}
          cursorCharacter="|"
          className="font-bold primary-color text-2xl sm:text-3xl md:text-4xl"
        />
      </div>
      <p className="font-JetBrains-Mono content-color w-full max-w-150 text-sm sm:text-md mx-auto mt-2 xl:ml-95 px-4 sm:px-6 text-center">
        Initialize your profile to join the competition
      </p>
      <div className="w-full px-4 sm:px-6">
        <Register />
      </div>
      <div className="w-full max-w-120 mt-5 font-JetBrains-Mono mb-6 cursor-pointer mx-auto px-4 sm:px-6 group">
        <p className="text-[#6c7280] group-hover:text-[#faf506]   transition-colors duration-200 w-full text-sm sm:text-base text-center">// Already a member? <span className="underline"> Login here</span></p>
      </div>
    </div>
  );
};

export default RegisterPage;
