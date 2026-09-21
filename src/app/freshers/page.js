import FreshersIntroOverlay from "./components/FreshersIntroOverlay";
import FreshersExperience from "./components/FreshersExperience";
import WhatsAppGroupSection from "./components/WhatsAppGroupSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Project Skeld | RC NITW",
  description: "Robotics Club NIT Warangal presents Project Skeld at NAB.",
};

export default function FreshersPage() {
  const whatsappLink =
    process.env.NEXT_PUBLIC_WHATSAPP_GROUP_LINK ||
    process.env.WHATSAPP_GROUP_LINK ||
    process.env.NEXT_PUBLIC_WHATSAPP_LINK ||
    process.env.WHATSAPP_LINK ||
    "";

  return (
    <>
      <FreshersIntroOverlay />
      <FreshersExperience>
        <WhatsAppGroupSection whatsappLink={whatsappLink} />
      </FreshersExperience>
    </>
  );
}