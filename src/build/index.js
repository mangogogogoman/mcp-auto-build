import fs from "fs";
import path from "path";
import { buildBackendProject } from "./buildBackendProject.js";
import { buildFrontendProject } from "./buildFrontendProject.js";

export async function build(projectRoot, projectName, revisions) {
  // 判断是否为后端项目或前端项目
  const pomXmlPath = path.join(projectRoot, "pom.xml");
  const packageJsonPath = path.join(projectRoot, "package.json");
  if (fs.existsSync(pomXmlPath)) {
    // 后端项目
    console.log("\n📌 执行 back_end 打包模式");
    await buildBackendProject(projectRoot, projectName, revisions);
  } else if (fs.existsSync(packageJsonPath)) {
    // 前端项目
    console.log("\n📌 执行 front_end 打包模式");
    await buildFrontendProject(projectRoot, projectName, revisions);
  } else {
    throw new Error("未找到 pom.xml 或 package.json 文件");
  }
}
