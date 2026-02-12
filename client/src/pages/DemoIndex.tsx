import { TranslationOverrideProvider } from "@/hooks/useLanguage";
import demoOverrides from "@/i18n/demoOverrides";
import Index from "./Index";

const DemoIndex = () => {
  return (
    <TranslationOverrideProvider overrides={demoOverrides}>
      <Index />
    </TranslationOverrideProvider>
  );
};

export default DemoIndex;
