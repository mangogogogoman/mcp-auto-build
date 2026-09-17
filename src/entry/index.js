import path from "path";
import fs from "fs";
import { getSvnRevision } from "../svnRevision/index.js";
import { build } from "../build/index.js";
import { buildBackendProject } from "../build/buildBackendProject.js";
import { buildFrontendProject } from "../build/buildFrontendProject.js";

export async function getProjectInfo(projectRoot) {
  const pomXmlPath = path.join(projectRoot, "pom.xml");
  const packageJsonPath = path.join(projectRoot, "package.json");

  let projectType = "unknown";
  if (fs.existsSync(pomXmlPath)) {
    projectType = "backend";
  } else if (fs.existsSync(packageJsonPath)) {
    projectType = "frontend";
  }

  const projectName = path.basename(projectRoot);
  const revisions = await getSvnRevision(projectRoot, projectName);
  const hasSvn = revisions[0] !== "unknown" || revisions[1] !== "unknown";

  return {
    projectName,
    projectType,
    hasSvn,
    projectRoot,
    currentRevision: revisions[0],
    maxRevision: revisions[1],
  };
}

export async function buildBackend(projectRoot, projectName, revision) {
  await buildBackendProject(projectRoot, projectName, [revision]);
  const targetDir = path.join(projectRoot, "ruoyi-admin", "target");
  const files = fs
    .readdirSync(targetDir)
    .filter((f) => f.endsWith(".jar") || f.endsWith(".war"));
  const jarFile = files.find(
    (f) => f.startsWith("ruoyi-admin-") && !f.startsWith("original-"),
  );
  return {
    projectName,
    revision,
    outputPath: jarFile ? path.join(targetDir, jarFile) : null,
  };
}

export async function buildFrontend(projectRoot, projectName, revision) {
  await buildFrontendProject(projectRoot, projectName, [revision]);
  const distPath = path.join(projectRoot, "dist");
  const files = fs.readdirSync(distPath).filter((f) => f.endsWith(".zip"));
  const zipFile = files.find((f) => f.startsWith(projectName));
  return {
    projectName,
    revision,
    outputPath: zipFile ? path.join(distPath, zipFile) : null,
  };
}

export async function buildPackage(projectRoot, saveProjectName) {
  let curDirName = saveProjectName || path.basename(projectRoot);
  const revisions = await getSvnRevision(projectRoot, curDirName);
  await build(projectRoot, curDirName, revisions);
  return {
    projectName: curDirName,
    revisions,
  };
}
