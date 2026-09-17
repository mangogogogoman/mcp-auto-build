import { runCommand, getDateString } from "../utils/common.js";
import fs from "fs";
import path from "path";

function renameJarWithVersion(projectRoot, revision) {
  console.log("\n===== 开始重命名打包文件 =====");
  const targetDir = path.join(projectRoot, "ruoyi-admin", "target");
  let files = [];

  try {
    files = fs
      .readdirSync(targetDir)
      .filter((f) => f.endsWith(".jar") || f.endsWith(".war"));
    files = files.filter((f) => !f.startsWith("original-"));
  } catch (e) {}

  if (files.length === 0) {
    throw new Error("未找到打包文件，请检查打包是否成功");
  }

  const dateStr = getDateString();
  const newName = `ruoyi-admin-${dateStr}-r${revision}.jar`;
  const oldPath = path.join(targetDir, files[0]);
  const newPath = path.join(targetDir, newName);

  if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
  fs.renameSync(oldPath, newPath);
  console.log(`\n✅ 重命名完成：\n${files[0]} --> ${newName}`);
}

export async function buildBackendProject(projectRoot, projectName, revisions) {
  await runCommand("mvn -v", "Maven 版本检查", projectRoot);
  await runCommand("mvn clean package", "Maven 清理+打包", projectRoot);
  renameJarWithVersion(projectRoot, revisions[0]);
  console.log(
    `\n🔖 当前${projectName} SVN 版本号：r${revisions[0]}${revisions[1] !== "unknown" && revisions[1] > revisions[0] ? "\n✨ 温馨提示：当前项目不是最新版本，建议更新到最新版本：r" + revisions[1] : ""}`,
  );
  console.log("\n🎉 全部完成！");
}
