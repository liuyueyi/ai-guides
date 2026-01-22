import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
   "/",
  {
    text: "LLM开发手册",
    icon: "diagram",
    prefix: "/tutorial/",
    children: [
      "",
      {
        text: "Hello LLM",
        prefix: "",
        children: ["hello-llm/", "hello-agent/"],
      },
      {
        text: "AI Coding",
        prefix: "",
        children: ["ai-coding/"],
      },
    ],
  },
  {
    text: "LLM应用开发",
    icon: "material",
    prefix: "/ai-dev/",
    children: [
      "",
      {
        text: "SpringAI",
        prefix: "",
        children: ["基础篇/", "进阶篇/", "应用篇/", "源码篇/"]
      }
    ]
  },
  { text: "百宝箱", icon: "tool", link: "https://app.ppai.top/" },
]);
