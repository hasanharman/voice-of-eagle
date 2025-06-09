"use client";

import { useI18n } from "@/lib/i18n/context";

import StadiumOne from "@/assets/1.webp";
import StadiumTwo from "@/assets/2.webp";
import StadiumThree from "@/assets/3.webp";
import StadiumFour from "@/assets/4.webp";

export default function ReadmePage() {
  const { t } = useI18n();

  return (
    <section className="flex flex-col h-full items-center justify-center p-4 relative overflow-hidden">
      {/* Background Images - Hidden on mobile, positioned on larger screens */}
      <div className="hidden lg:block">
        {/* Top Left */}
        <div className="p-2 bg-white rounded-xl drop-shadow-lg absolute z-0 top-8 left-8 rotate-2">
          <img
            className="w-48 xl:w-64 rounded-lg"
            src={StadiumOne.src}
            alt="Stadium One"
          />
        </div>

        {/* Bottom Left */}
        <div className="p-2 bg-white rounded-xl drop-shadow-lg absolute z-0 bottom-8 left-8 -rotate-2">
          <img
            className="w-48 xl:w-64 rounded-lg"
            src={StadiumTwo.src}
            alt="Stadium Two"
          />
        </div>

        {/* Top Right */}
        <div className="p-2 bg-white rounded-xl drop-shadow-lg absolute z-0 top-8 right-8 -rotate-2">
          <img
            className="w-48 xl:w-64 rounded-lg"
            src={StadiumThree.src}
            alt="Stadium Three"
          />
        </div>

        {/* Bottom Right */}
        <div className="p-2 bg-white rounded-xl drop-shadow-lg absolute z-0 bottom-8 right-8 rotate-2">
          <img
            className="w-48 xl:w-64 rounded-lg"
            src={StadiumFour.src}
            alt="Stadium Four"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto relative z-10 ">
        <div className="space-y-4 md:space-y-6 leading-relaxed">
          <h1>{t("readme.greeting")}</h1>
          <p>{t("readme.introduction")}</p>
          <p>{t("readme.siteDescription")}</p>
          <p>{t("readme.independence")}</p>
          <p>{t("readme.closing")} 🦅</p>
        </div>
      </div>

      {/* Mobile Image Gallery - Only visible on mobile */}
      <div className="lg:hidden mt-8 w-full max-w-md">
        <div className="grid grid-cols-2 gap-8">
          <div className="p-2 bg-white rounded-xl drop-shadow-lg rotate-2 hover:scale-105 hover:rotate-0 transition-transform">
            <img
              className="w-full rounded-lg"
              src={StadiumOne.src}
              alt="Stadium One"
            />
          </div>
          <div className="p-2 bg-white rounded-xl drop-shadow-lg -rotate-2 hover:scale-105 hover:rotate-0 transition-transform">
            <img
              className="w-full rounded-lg"
              src={StadiumTwo.src}
              alt="Stadium Two"
            />
          </div>
          <div className="p-2 bg-white rounded-xl drop-shadow-lg -rotate-2 hover:scale-105 hover:rotate-0 transition-transform">
            <img
              className="w-full rounded-lg"
              src={StadiumThree.src}
              alt="Stadium Three"
            />
          </div>
          <div className="p-2 bg-white rounded-xl drop-shadow-lg rotate-2 hover:scale-105 hover:rotate-0 transition-transform">
            <img
              className="w-full rounded-lg"
              src={StadiumFour.src}
              alt="Stadium Four"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
