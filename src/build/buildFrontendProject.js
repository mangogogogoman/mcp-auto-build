import { runCommand, getDateString } from "../utils/common.js";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

function findPackageJsonCommand(projectRoot) {
  // 1. 拼接 package.json 完整路径
  const packageJsonPath = path.join(projectRoot, "package.json");

  try {
    // 2. 读取并解析 package.json
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
    const packageJson = JSON.parse(packageJsonContent);

    // 3. 获取 scripts 对象（不存在则为空对象）
    const scripts = packageJson.scripts || {};

    // 4. 优先使用 build:prod，其次使用 build，都没有则用默认
    if (scripts["build:prod"]) {
      return "npm run build:prod";
    } else if (scripts["build"]) {
      return "npm run build";
    }

    // 5. 都不存在时返回默认
    return "npm run build";
  } catch (err) {
    // 找不到 package.json 或解析失败，返回默认命令
    console.log("\n❌ 未找到或无法读取 package.json，使用默认构建命令");
    return "npm run build";
  }
}

// ==============================
// 压缩 dist
// ==============================
function zipDistFolder(projectRoot, projectName, revision) {
  const distPath = path.join(projectRoot, "dist");
  if (!fs.existsSync(distPath)) {
    console.log("\n✅ 创建 dist 文件夹");
    fs.mkdirSync(distPath);
  }

  const dateStr = getDateString();
  const zipName = `${projectName}-${dateStr}-r${revision}.zip`;
  const zipPath = path.join(projectRoot, zipName);

  const z = new AdmZip();
  z.addLocalFolder(distPath);
  z.writeZip(zipPath);

  const target = path.join(distPath, zipName);
  if (fs.existsSync(target)) fs.unlinkSync(target);
  fs.renameSync(zipPath, target);

  console.log(`\n✅ 打包完成在 dist 目录下：${zipName}`);
}

export async function buildFrontendProject(
  projectRoot,
  projectName,
  revisions,
) {
  await runCommand("npm -v", "npm 版本检查", projectRoot);
  let command;
  // 查找 package.json 中的 build 命令
  command = findPackageJsonCommand(projectRoot);
  await runCommand(command, "npm 打包", projectRoot);
  await zipDistFolder(projectRoot, projectName, revisions[0]);
  console.log(
    `\n🔖 当前${projectName} SVN 版本号：r${revisions[0]}${revisions[1] !== "unknown" && revisions[1] > revisions[0] ? "\n✨ 温馨提示：当前项目不是最新版本，建议更新到最新版本：r" + revisions[1] : ""}`,
  );
  console.log("\n🎉 全部完成！");
}
