module.exports = {
  extends: ["@grafana/eslint-config"],
  rules: {
    "@typescript-eslint/explicit-member-accessibility": 0
  },
  overrides: [
    {
      files: ["**/*.tsx"],
      rules: {
        "react/prop-types": 0,
      },
    },
  ]
};
