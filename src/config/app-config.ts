import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "TalentPulse AI",
  version: packageJson.version,
  copyright: `© ${currentYear}, TalentPulse AI HR.`,
  meta: {
    title: "TalentPulse AI: Autonomous HR & Candidate Intelligence",
    description:
      "Enterprise HR recruitment portal for automated talent acquisition, candidate screening, and hiring pipelines.",
  },
};
