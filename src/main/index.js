import path from "path";
import { getSvnRevision } from "../svnRevision/index.js";
import { build } from "../build/index.js";

/**
 * 打包项目
 * @param {string} projectRoot 项目根目录，可以是本地目录的绝对路径
 * @param {string} saveProjectName 保存项目名称的路径，如果没有当前工程，则使用项目根目录的名称
 */
export async function buildPackage(projectRoot, saveProjectName) {
  // 1. 获取工作目录
  let curDirName = saveProjectName || path.basename(projectRoot);
  // 2. 获取 SVN 版本
  const revisions = await getSvnRevision(projectRoot, curDirName);
  // 3. 打包项目
  await build(projectRoot, curDirName, revisions);
}
