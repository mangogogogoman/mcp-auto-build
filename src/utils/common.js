import cp from "child_process";

export function runCommand(command, desc, cwd = process.cwd()) {
  console.log(`\n===== 正在执行：${desc} =====`);
  console.log(`命令：${command}`);

  return new Promise((resolve, reject) => {
    const child = cp.spawn(command, {
      shell: true,
      stdio: "pipe",
      encoding: "utf-8",
      cwd,
    });
    child.stdout.on("data", (data) => console.log(data.toString().trim()));
    child.stderr.on("data", (data) => console.log(data.toString().trim()));
    child.on("close", (code) => {
      if (code !== 0) {
        console.log(`\n❌ 命令执行失败，错误码：${code}`);
        reject(new Error(`命令执行失败：${desc}，错误码：${code}`));
      } else {
        console.log(`\n✅ ${desc} 执行成功`);
        resolve();
      }
    });
  });
}

// ==============================
// 原生获取日期：yyyy-m-d
// ==============================
export function getDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
