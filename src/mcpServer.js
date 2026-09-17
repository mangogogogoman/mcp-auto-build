import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  buildPackage,
  getProjectInfo,
  buildBackend,
  buildFrontend,
} from "./entry/index.js";

const server = new McpServer({
  name: "build-server",
  title: "前后端自动打包服务",
  version: "0.2.0",
});

server.registerTool(
  "getProjectInfo",
  {
    title: "获取项目信息",
    description: `获取项目的基本信息，包括项目名称、类型（前端/后端/未知）和是否有SVN版本控制。
    
使用场景：
- 在打包前确认项目类型
- 检查项目是否有SVN版本信息`,
    inputSchema: {
      projectRoot: z.string().describe("本地工程的根路径"),
    },
  },
  async ({ projectRoot }) => {
    try {
      const info = await getProjectInfo(projectRoot);
      let svnText = `是否有SVN：${info.hasSvn ? "是" : "否"}`;
      if (info.hasSvn) {
        svnText += `\n- 当前版本：r${info.currentRevision}`;
        if (info.maxRevision !== "unknown") {
          svnText += `\n- 最大版本：r${info.maxRevision}`;
          if (info.maxRevision > info.currentRevision) {
            svnText += `\n⚠️ 温馨提示：当前项目不是最新版本`;
          }
        }
      }
      return {
        content: [
          {
            type: "text",
            text: `项目信息获取完成：
- 项目名称：${info.projectName}
- 项目类型：${info.projectType}
- ${svnText}
- 项目路径：${info.projectRoot}`,
          },
          {
            type: "text",
            text: JSON.stringify(info, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 获取项目信息失败：${error.message}`,
          },
        ],
      };
    }
  },
);

server.registerTool(
  "buildBackend",
  {
    title: "后端项目打包",
    description: `对后端Java项目进行Maven打包，支持若依框架。打包结果为带有日期和SVN版本号的jar文件。
    
使用场景：
- 单独对后端项目进行打包
- 在CI/CD流程中分步执行`,
    inputSchema: {
      projectRoot: z.string().describe("本地工程的根路径"),
      projectName: z.string().describe("项目名称"),
      revision: z.string().describe("SVN版本号"),
    },
  },
  async ({ projectRoot, projectName, revision }) => {
    try {
      const result = await buildBackend(projectRoot, projectName, revision);
      return {
        content: [
          {
            type: "text",
            text: `后端项目打包完成：
- 项目名称：${result.projectName}
- 版本号：r${result.revision}
- 输出路径：${result.outputPath || "未找到打包文件"}`,
          },
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 后端项目打包失败：${error.message}`,
          },
        ],
      };
    }
  },
);

server.registerTool(
  "buildFrontend",
  {
    title: "前端项目打包",
    description: `对前端项目进行npm打包，支持Vue/React等框架。打包结果为带有日期和SVN版本号的zip压缩包。
    
使用场景：
- 单独对前端项目进行打包
- 在CI/CD流程中分步执行`,
    inputSchema: {
      projectRoot: z.string().describe("本地工程的根路径"),
      projectName: z.string().describe("项目名称"),
      revision: z.string().describe("SVN版本号"),
    },
  },
  async ({ projectRoot, projectName, revision }) => {
    try {
      const result = await buildFrontend(projectRoot, projectName, revision);
      return {
        content: [
          {
            type: "text",
            text: `前端项目打包完成：
- 项目名称：${result.projectName}
- 版本号：r${result.revision}
- 输出路径：${result.outputPath || "未找到打包文件"}`,
          },
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 前端项目打包失败：${error.message}`,
          },
        ],
      };
    }
  },
);

server.registerTool(
  "buildPackage",
  {
    title: "打包工程",
    description: `完整打包工程，包含获取项目信息、获取SVN版本号、执行打包等全部步骤。支持本地工程的打包，打包结果为带有SVN版本的标准格式。
    
使用场景：
- 需要一次性完成整个打包流程
- 简单的打包任务`,
    inputSchema: {
      projectRoot: z.string().describe("本地工程的根路径"),
      saveProjectName: z
        .string()
        .describe(
          "保存项目名称的路径，如果没有当前工程，则使用项目根目录的名称",
        )
        .optional(),
    },
  },
  async ({ projectRoot, saveProjectName }) => {
    try {
      const result = await buildPackage(projectRoot, saveProjectName);
      return {
        content: [
          {
            type: "text",
            text: `打包完成：
- 项目名称：${result.projectName}
- 当前版本：r${result.revisions[0]}${result.revisions[1] !== "unknown" && result.revisions[1] > result.revisions[0] ? "\n⚠️ 温馨提示：当前项目不是最新版本，建议更新到最新版本：r" + result.revisions[1] : ""}`,
          },
          {
            type: "text",
            text: JSON.stringify(
              {
                projectName: result.projectName,
                currentRevision: result.revisions[0],
                maxRevision: result.revisions[1],
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `❌ 打包失败：${error.message}`,
          },
        ],
      };
    }
  },
);

const transport = new StdioServerTransport();
server.connect(transport);
