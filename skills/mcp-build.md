---
name: "mcp-build"
version: "1.0.0"
description: "Automatically builds frontend and backend projects via MCP server. Invoke when user needs to build Java/Maven or JavaScript/npm projects, or when user asks for project packaging."
allowed-tools:
  - getProjectInfo
  - buildBackend
  - buildFrontend
trigger-scenarios:
  - 用户需要打包Java后端Maven项目
  - 用户需要打包前端npm项目
input-params:
  projectRoot: string # 必填，本地工程根路径
---

# MCP 前后端自动打包技能

基于 Model Context Protocol 的前后端项目自动打包技能，支持 Maven（后端）和 npm（前端）项目的自动化打包。

## 功能特性

- 📦 **后端打包**：支持 Maven 项目，自动生成带版本号的 jar 文件
- 📱 **前端打包**：支持 npm 项目，自动生成带版本号的 zip 压缩包
- 📊 **版本管理**：自动获取 SVN 版本号，支持向上查找多层目录
- 🎯 **分步执行**：提供多个独立工具，便于流程编排和调试
- 🔄 **错误处理**：完善的异常处理，不影响 MCP 服务稳定性

## 工具列表

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

## 使用流程

### 分步执行模式

```
Step 1: getProjectInfo → 获取项目类型、名称、SVN版本号
Step 2: buildFrontend / buildBackend → 根据 projectType 执行打包
```

## 使用示例

### 示例 1：分步打包前端项目

```
1. 调用 getProjectInfo 获取项目信息
   参数: {"projectRoot": "/path/to/frontend-project"}

2. 根据返回的 projectType="frontend"，调用 buildFrontend
   参数: {"projectRoot": "/path/to/frontend-project", "projectName": "my-app", "revision": "123"}
```

### 示例 2：分步打包后端项目

```
1. 调用 getProjectInfo 获取项目信息
   参数: {"projectRoot": "/path/to/backend-project"}

2. 根据返回的 projectType="backend"，调用 buildBackend
   参数: {"projectRoot": "/path/to/backend-project", "projectName": "my-service", "revision": "456"}
```

## 环境要求

- Node.js >= 18.0.0
- Java/Maven（后端项目打包）
- Node.js/npm（前端项目打包）
- SVN 客户端（版本号获取）

## 注意事项

1. 后端项目需包含 `pom.xml` 文件，前端项目需包含 `package.json` 文件
2. SVN 版本号通过读取 `.svn/wc.db` 数据库获取，支持向上查找最多 10 层目录
3. 后端项目默认输出路径为 `ruoyi-admin/target/`，可根据实际项目结构调整
4. 前端项目打包命令优先使用 `npm run build:prod`，其次使用 `npm run build`
