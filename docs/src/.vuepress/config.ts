import { defaultTheme, defineUserConfig } from "vuepress";
import { copyCodePlugin } from "vuepress-plugin-copy-code2";

export default defineUserConfig({
  base: "/hybridilusmu/",
  dest: "build",
  lang: "en-US",
  title: "Hybridilusmu Documentation",
  head: [["link", { rel: "icon", href: "/logo/favicon.png" }]],
  theme: defaultTheme({
    repo: "funidata/hybridilusmu",
    logo: "/logo/hybridilusmulogo1whitebgsmall.jpg",
    logoDark: "/logo/hybridilusmulogo1darkbgsmall.jpg",
    docsDir: "docs",
    sidebar: [
      "/introduction.md",
      "/developing.md",
      "/tests.md",
      "/releases.md",
    ],
  }),
  plugins: [copyCodePlugin()],
});
