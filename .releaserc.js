module.exports = {
  branches: [
    "master",
    {
      name: "beta",
      prerelease: true,
    },
  ],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/gitlab",
      {
        successComment: false,
        failComment: false,
        failTitle: false,
        assets: [
          {
            path: "module.zip",
            label: "module.zip",
            type: "package",
            filepath: "/module.zip",
            target: "generic_package",
          },
          {
            path: "pf2e_pt-BR/module.json",
            label: "module.json",
            filepath: "/module.json",
            target: "generic_package",
          },
        ],
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "pf2e_pt-BR/module.json"],
        message:
          "chore(release): ${nextRelease.version}\n\n${nextRelease.notes}",
      },
    ],
  ],
};
