import {
  AtSign,
  IdCard,
  IdCardLanyard,
  KeyRound,
  RotateCcwKey,
} from "lucide-react";
import React from "react";

const Register = () => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="mt-6 sm:mt-10 w-full max-w-120 p-4 sm:p-6 md:p-10 max-h-fit rounded-xl bg-[#18262b] border border-gray-700 mx-auto">
        <form className="mx-auto w-full flex flex-col justify-center items-center">
          <div className="w-full">
            <label className="text-white flex gap-2 text-sm sm:text-base">
              <IdCard className="primary-color w-4 h-4 sm:w-5 sm:h-5" />
              Name
            </label>
            <input
              className="text-white font-JetBrains-Mono mb-5 mt-1 p-3 w-full bg-[#101e22] border border-gray-600 rounded-lg focus:outline-none focus:border-[#faf506] focus:ring-1 focus:ring-[#faf506] transition-colors text-sm sm:text-base"
              placeholder="enter_name"
            />
          </div>
          <div className="w-full">
            <label className="text-white flex gap-2 text-sm sm:text-base">
              <IdCardLanyard className="primary-color w-4 h-4 sm:w-5 sm:h-5" />
              Username
            </label>
            <input
              className="text-white mb-5 font-JetBrains-Mono mt-1 p-3 w-full bg-[#101e22] border border-gray-600 rounded-lg focus:outline-none focus:border-[#faf506] focus:ring-1 focus:ring-[#faf506] transition-colors text-sm sm:text-base"
              placeholder="enter_username"
            />
          </div>
          <div className="w-full">
            <label className="text-white flex gap-2 text-sm sm:text-base">
              <AtSign className="primary-color w-4 h-4 sm:w-5 sm:h-5" />
              Email Address
            </label>
            <input
              className="text-white mb-5 font-JetBrains-Mono bg-[#101e22] mt-1 p-3 w-full border border-gray-600 rounded-lg focus:outline-none focus:border-[#faf506] focus:ring-1 focus:ring-[#faf506] transition-colors text-sm sm:text-base"
              placeholder="enter_email"
            />
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <div className="w-full">
              <label className="text-white flex gap-2 text-sm sm:text-base">
                <KeyRound className="primary-color w-4 h-4 sm:w-5 sm:h-5" />
                Password
              </label>
              <input
                className="text-white mb-5   font-JetBrains-Mono mt-1 p-3 w-full bg-[#101e22] border border-gray-600 rounded-lg focus:outline-none focus:border-[#faf506] focus:ring-1 focus:ring-[#faf506] transition-colors text-sm sm:text-base"
                placeholder="******"
              />
            </div>
            <div className="w-full">
              <label className="text-white flex gap-2 text-sm sm:text-base">
                <RotateCcwKey className="primary-color w-4 h-4 sm:w-5 sm:h-5" />
                Confirm Password
              </label>
              <input
                className="text-white mb-5 mt-1 font-JetBrains-Mono p-3 w-full bg-[#101e22] border border-gray-600 rounded-lg focus:outline-none focus:border-[#faf506] focus:ring-1 focus:ring-[#faf506] transition-colors text-sm sm:text-base"
                placeholder="******"
              />
            </div>
          </div>
        </form>
        <div className="bg-(--primary-color) p-2 sm:p-3 font-bold cursor-pointer w-full rounded-lg text-center shadow-[0_0_18px_rgba(250,245,6,0.45)] hover:shadow-[0_0_26px_rgba(250,245,6,0.75)] transition-shadow duration-300">
          <button className="text-black text-sm sm:text-base">&#91; Initialize Account &#93;</button>
        </div>
        <div className="content-color flex mt-5 mb-5 justify-center items-center gap-2">
          <div className="w-20 sm:w-32 md:w-44 bg-(--content-color) h-0.5"/>
          <div className="text-sm sm:text-base">OR</div>
          <div className="w-20 sm:w-32 md:w-44 h-0.5 bg-(--content-color)"/>
        </div>
        <div>
          <button className="bg-[#101e22] cursor-pointer flex justify-center gap-2 sm:gap-3 p-2 sm:p-3 w-full rounded-lg border border-gray-600 hover:border-[#faf506] items-center transition-colors">
            <img className="size-4 sm:size-5" src="Google.png" alt="Google" />
            <p className="text-white font-bold font-JetBrains-Mono text-xs sm:text-sm md:text-base">Continue with Google</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
