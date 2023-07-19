import { defaultTheme, defineUserConfig } from "vuepress";

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
  }),
});
