import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({

  "/": [
      "",
      {
        text: "技术管理",
        icon: "people",
        prefix: "tutorial/",
        collapsible: true,
        children: [ "ai-coding/", "hello-llm/" ],
      },
  ],
  "/tutorial/": [
    "",
    {
      text: "AiCoding",
      icon: "write",
      prefix: "ai-coding/",
      collapsible: true,
      children: "structure",
    },
     {
        text: "Hello LLM",
        icon: "define",
        prefix: "hello-llm/",
        collapsible: true,
        children: "structure",
      },
       {
        text: "Hello Agent",
        icon: "write",
        prefix: "hello-agent/",
        collapsible: true,
        children: "structure",
      },
  ],
  "/ai-dev/": [
     "",
    {
      text: "基础篇",
      collapsible: true,
      prefix: "基础篇/",
      children: "structure",
    },
    {
      text: "进阶篇",
      collapsible: true,
      prefix: "进阶篇/",
      children: "structure",
    },
    {
      text: "应用篇",
      collapsible: true,
      prefix: "应用篇/",
      children: "structure",
    },
    {
      text: "源码篇",
      collapsible: true,
      prefix: "源码篇/",
      children: "structure",
    }
  ],
});
