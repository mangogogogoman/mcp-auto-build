# MCP 前后端自动打包服务

一个基于 Node.js 的前后端项目自动打包服务，支持 Maven（后端）和 npm（前端）项目的自动化打包。

## 功能特性

- 📦 **后端打包**：支持 Maven 项目，自动生成带版本号的 jar 文件
- 📱 **前端打包**：支持 npm 项目，自动生成带版本号的 zip 压缩包
- 📊 **版本管理**：自动获取 SVN 版本号，支持向上查找多层目录
- 🎯 **分步执行**：提供多个独立工具，便于流程编排和调试
- 🔄 **错误处理**：完善的异常处理，不影响 MCP 服务稳定性

## 环境要求

- Node.js >= 18.0.0
- Java/Maven（后端项目打包）
- Node.js/npm（前端项目打包）
- SVN 客户端（版本号获取）

## 安装依赖

```bash
npm install
```

## 启动服务

```bash
npm start
```

## MCP Tools

### 1. getProjectInfo

获取项目基本信息，包括项目名称、类型和 SVN 版本信息。

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectRoot | string | 是 | 本地工程的根路径 |

**返回示例：**

```json
{
  "projectName": "my-project",
  "projectType": "frontend",
  "hasSvn": true,
  "projectRoot": "/path/to/project",
  "currentRevision": "123",
  "maxRevision": "125"
}
```

### 2. buildBackend

对后端 Java 项目进行 Maven 打包。

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectRoot | string | 是 | 本地工程的根路径 |
| projectName | string | 是 | 项目名称 |
| revision | string | 是 | SVN 版本号 |

**返回示例：**

```json
{
  "projectName": "my-project",
  "revision": "123",
  "outputPath": "/path/to/project/ruoyi-admin/target/ruoyi-admin-2026-6-28-r123.jar"
}
```

### 3. buildFrontend

对前端项目进行 npm 打包。

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectRoot | string | 是 | 本地工程的根路径 |
| projectName | string | 是 | 项目名称 |
| revision | string | 是 | SVN 版本号 |

**返回示例：**

```json
{
  "projectName": "my-project",
  "revision": "123",
  "outputPath": "/path/to/project/dist/my-project-2026-6-28-r123.zip"
}
```

### 4. buildPackage

完整打包工程，包含所有步骤。

**参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| projectRoot | string | 是 | 本地工程的根路径 |
| saveProjectName | string | 否 | 保存项目名称的路径 |

**返回示例：**

```json
{
  "projectName": "my-project",
  "currentRevision": "123",
  "maxRevision": "125"
}
```

## 使用流程

### 分步执行模式

```
Step 1: getProjectInfo → 获取项目类型、名称、SVN版本号
Step 2: buildFrontend / buildBackend → 根据 projectType 执行打包
```

### 一键打包模式

```
buildPackage → 自动完成所有步骤
```

## Dify 流程编排示例

可在 Dify 中创建工作流，将各个工具串联使用：

1. **输入节点**：接收 projectRoot 参数
2. **getProjectInfo**：获取项目信息
3. **条件分支**：根据 projectType 选择打包方式
   - 前端 → buildFrontend
   - 后端 → buildBackend
4. **输出节点**：返回打包结果

## 项目结构

```
src/
├── mcpServer.js          # MCP Server 入口
├── entry/
│   └── index.js          # 工具函数入口
├── build/
│   ├── index.js          # 打包入口
│   ├── buildBackendProject.js   # 后端打包逻辑
│   └── buildFrontendProject.js  # 前端打包逻辑
├── svnRevision/
│   └── index.js          # SVN版本获取
└── utils/
    └── common.js         # 通用工具函数
```

## 注意事项

1. 后端项目需包含 `pom.xml` 文件，前端项目需包含 `package.json` 文件
2. SVN 版本号通过读取 `.svn/wc.db` 数据库获取，支持向上查找最多 10 层目录
3. 后端项目默认输出路径为 `ruoyi-admin/target/`，可根据实际项目结构调整
4. 前端项目打包命令优先使用 `npm run build:prod`，其次使用 `npm run build`

## License

ISC
