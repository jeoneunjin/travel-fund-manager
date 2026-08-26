import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: [".next/**", "lib/generated/**"] },
  ...coreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
