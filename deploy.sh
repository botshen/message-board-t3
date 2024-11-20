#!/bin/bash

# 定义变量
USER='blog'
SERVER='1.94.239.72'
DEPLOY_PATH="/home/$USER"

function title {
  echo
  echo "###############################################################################"
  echo "## $1"
  echo "###############################################################################"
  echo
}

# 本地打包
title '打包项目文件'
mkdir -p temp
tar --exclude='./.git' \
    --exclude='./.env*' \
    --exclude=".next*" \
    --exclude='./node_modules' \
    --exclude='./temp' \
    -zcf temp/repo.tar.gz .

# 清理旧版本并上传
title '上传到服务器'
ssh $USER@$SERVER "mkdir -p $DEPLOY_PATH"
scp -q temp/repo.tar.gz $USER@$SERVER:$DEPLOY_PATH/repo.tar.gz

# 清理本地临时文件
title '清理本地临时文件'
rm -rf temp

# 在服务器上执行部署
title '服务器端部署'
ssh $USER@$SERVER "cd $DEPLOY_PATH && \
    # 备份数据库文件（如果存在）
    if [ -f db.sqlite ]; then
        mv db.sqlite db.sqlite.bak
    fi && \
    
    # 清理旧文件（保留数据库备份）
    find . -mindepth 1 ! -name 'db.sqlite.bak' -delete && \
    
    # 解压新代码
    tar -xzf repo.tar.gz && \
    rm repo.tar.gz && \
    
    # 还原数据库文件
    if [ -f db.sqlite.bak ]; then
        mv db.sqlite.bak db.sqlite
    fi && \
    
    # 安装依赖并构建
    pnpm install && \
    pnpm build && \
    
    # 使用PM2重启应用
    pm2 delete blog 2>/dev/null || true && \
    pm2 start npm --name blog -- start"

title '部署成功'