import path from "path";
import fs from "fs";
import { createRequire } from "module";
import initSqlJs from "sql.js";

// 纯 WASM 引擎单例：wasm 随 npm 包分发，无需 node-gyp 编译或下载预编译二进制
const require = createRequire(import.meta.url);
let sqlEnginePromise;
function getSqlEngine() {
  sqlEnginePromise ??= initSqlJs({
    locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm"),
  });
  return sqlEnginePromise;
}

/**
 * 循环向上查找 .svn/wc.db 文件
 * @param {string} startDir - 起始查找目录
 * @param {string} curDirName - 当前目录名
 * @returns {Promise<[string, string]>} [当前目录版本, 目录下最大版本]
 */
async function findWcDbRevision(startDir, curDirName) {
  let level = 0;
  const MAX_SEARCH_LEVEL = 10; // 最多向上查10层，避免死循环/卡死
  let rev = ["unknown", "unknown"];
  let currentDir = startDir;
  const localRelpath = curDirName;

  while (level < MAX_SEARCH_LEVEL) {
    const wcDb = path.join(currentDir, ".svn", "wc.db");
    if (fs.existsSync(wcDb)) {
      try {
        const isParentDir = level > 0;
        if (isParentDir) {
          rev = await queryRevision(wcDb, localRelpath, "");
        } else {
          rev = await queryRevision(wcDb, "", null);
        }
        if (rev[0] !== "unknown" || rev[1] !== "unknown") break;
      } catch (e) {
        continue;
      }
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
    level++;
  }
  return rev;
}

/**
 * 从 wc.db 查询 SVN 版本号
 * @param {string} wcDbPath - wc.db 路径
 * @param {string} localRelpath - 本地相对路径
 * @param {string|null} parentRelpath - 父路径
 * @returns {Promise<[string, string]>}
 */
async function queryRevision(wcDbPath, localRelpath, parentRelpath) {
  const result = ["unknown", "unknown"];
  let db;
  try {
    const SQL = await getSqlEngine();
    // ponytail: wc.db 整体读入内存做只读查询（不触碰 SVN 库锁）；上限是超大工作副本时内存占用≈wc.db 文件大小，届时升级为 better-sqlite3/node:sqlite 流式只读驱动
    db = new SQL.Database(fs.readFileSync(wcDbPath));
    const isChild = parentRelpath !== null;

    // 第一条 SQL：当前目录版本
    const current = db.exec(
      isChild
        ? `SELECT changed_revision FROM nodes WHERE local_relpath = ? AND parent_relpath = ?`
        : `SELECT changed_revision FROM nodes WHERE local_relpath = ?`,
      isChild ? [localRelpath, parentRelpath] : [localRelpath],
    );
    const currentRev = current[0]?.values[0]?.[0];
    if (currentRev != null) result[0] = currentRev.toString();

    // 第二条 SQL：当前目录下最大版本号
    const max = db.exec(
      isChild
        ? `SELECT MAX(changed_revision) AS max_rev FROM nodes WHERE local_relpath LIKE ?`
        : `SELECT MAX(changed_revision) AS max_rev FROM nodes`,
      isChild ? [`${localRelpath}/%`] : [],
    );
    const maxRev = max[0]?.values[0]?.[0];
    if (maxRev != null) result[1] = maxRev.toString();
  } catch {
    // 查询出错不阻塞，返回已取到的部分结果
  } finally {
    db?.close();
  }
  return result;
}

/**
 * 对外导出方法：获取 SVN 版本
 * @param {string} projectRoot 项目根目录
 * @param {string} curDirName 当前目录名称
 * @returns {Promise<[string, string]>}
 */
export async function getSvnRevision(projectRoot, curDirName) {
  return await findWcDbRevision(projectRoot, curDirName);
}
