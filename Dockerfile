# 使用官方 Node.js 20 镜像作为基础镜像
FROM node:20

# 设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 pnpm-lock.yaml 文件到工作目录
COPY package.json pnpm-lock.yaml ./

RUN npm config set registry https://registry.npmmirror.com

# 全局安装 pnpm
RUN npm install -g pnpm

RUN pnpm config set registry https://registry.npmmirror.com

# 安装项目依赖
RUN pnpm install 

# 复制其他源代码文件到工作目录
COPY . .
RUN npx prisma generate
RUN pnpm build

# 暴露端口 3000
EXPOSE 3000

# 启动应用
CMD [ "pnpm", "start" ]
