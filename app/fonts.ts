import localFont from "next/font/local";

export const zalandoSans = localFont({
  src: [
    {
      path: "../public/fonts/ZalandoSansSemiExpanded-VariableFont_wght.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../public/fonts/ZalandoSansSemiExpanded-Italic-VariableFont_wght.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-zalando-sans",
  display: "swap",
});

export const fonts = {
  zalandoSans,
};
