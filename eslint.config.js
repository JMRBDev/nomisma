//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    ignores: ["src/components/ui/**", ".output/**", "convex/_generated/**"],
  },
  {
    rules: {
      "max-lines": [
        "error",
        { max: 150, skipBlankLines: true, skipComments: true },
      ],
    },
  },
]
