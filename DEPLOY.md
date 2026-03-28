# 部署指南

由于环境权限限制，我们无法直接使用CLI工具部署项目。以下是手动部署到主流静态网站托管服务的详细步骤：

## 部署到Vercel

1. 访问 [Vercel官网](https://vercel.com) 并登录或注册账号
2. 点击 "Add New Project" 按钮
3. 选择 "Import Git Repository" 选项
4. 输入项目的Git仓库地址（如果项目已托管在GitHub、GitLab或Bitbucket）
   - 或选择 "Import Directory" 上传本地项目文件
5. 配置部署设置：
   - Framework Preset: 选择 "Other"
   - Build Command: 留空（静态网站不需要构建）
   - Output Directory: 留空（使用根目录）
6. 点击 "Deploy" 按钮开始部署
7. 部署完成后，Vercel会提供一个可访问的URL

## 部署到Netlify

1. 访问 [Netlify官网](https://www.netlify.com) 并登录或注册账号
2. 点击 "Add new site" 按钮
3. 选择 "Import an existing project" 选项
4. 连接到Git仓库或选择 "Deploy manually" 上传本地项目文件夹
5. 配置部署设置：
   - Build command: 留空
   - Publish directory: 留空（使用根目录）
6. 点击 "Deploy site" 按钮开始部署
7. 部署完成后，Netlify会提供一个可访问的URL

## 部署到GitHub Pages

1. 将项目推送到GitHub仓库
2. 在仓库设置中，找到 "Pages" 选项
3. 选择 "Source" 为 "Deploy from a branch"
4. 选择分支（通常为main或master）
5. 选择文件夹为 "/root"
6. 点击 "Save" 按钮
7. GitHub Pages会自动构建并部署项目
8. 部署完成后，会提供一个可访问的URL

## 部署到其他静态网站托管服务

项目是一个纯静态网站，包含以下文件：
- `index.html` - 主页面
- `css/style.css` - 样式文件
- `js/` - JavaScript文件目录

您可以将这些文件上传到任何支持静态网站托管的服务，如：
- Amazon S3 + CloudFront
- Google Cloud Storage
- Azure Blob Storage
- 传统的Web服务器（Apache、Nginx等）

## 测试模式

项目内置了测试模式，当API调用失败时会自动使用模拟数据，方便快速体验核心功能。这对于演示和测试非常有用，无需依赖外部API服务。

## 注意事项

- 确保所有文件都正确上传，包括HTML、CSS和JavaScript文件
- 检查文件路径是否正确，确保CSS和JavaScript文件能够被正确加载
- 对于需要HTTPS的服务，确保托管服务支持HTTPS
- 测试模式下，系统会使用模拟数据，无需网络连接即可体验核心功能