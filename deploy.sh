#!/bin/bash

# 定义变量
USER='blog'
SERVER='1.94.239.72'
TIME=$(date +%Y%m%d%H%M%S)
DEPLOY_PATH="/home/$USER/releases/$TIME"
SHARED_PATH="/home/$USER/shared"

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
title '上传并清理旧版本'
ssh $USER@$SERVER "mkdir -p $DEPLOY_PATH"
ssh $USER@$SERVER "cd /home/$USER/releases && ls -d */ | sort | head -n -3 | xargs -I {} rm -rf {}"
scp -q temp/repo.tar.gz $USER@$SERVER:$DEPLOY_PATH/repo.tar.gz

# 清理本地临时文件
title '清理本地临时文件'
rm -rf temp

# 在服务器上执行部署
title '服务器端部署'
ssh $USER@$SERVER /bin/bash << EOF
    set -e
    
    # 准备环境
    mkdir -p $SHARED_PATH
    touch $SHARED_PATH/.env
    
    # 配置 Docker 镜像源
    if [ ! -f /etc/docker/daemon.json ]; then
        sudo mkdir -p /etc/docker
        echo '{
            "registry-mirrors": [
                "https://mirror.ccs.tencentyun.com",
                "https://registry.docker-cn.com",
                "https://docker.mirrors.ustc.edu.cn"
            ]
        }' | sudo tee /etc/docker/daemon.json
        sudo systemctl restart docker
    fi
    
    # 检查并创建 Docker 网络
    NETWORK_NAME="20240323-153212_app-network"
    if ! docker network ls | grep -q \$NETWORK_NAME; then
        echo "创建 Docker 网络: \$NETWORK_NAME"
        docker network create \$NETWORK_NAME
    else
        echo "Docker 网络已存在: \$NETWORK_NAME"
    fi
    
    # 解压并配置
    cd $DEPLOY_PATH
    tar -zxf repo.tar.gz && rm repo.tar.gz
    cp $SHARED_PATH/.env $DEPLOY_PATH/.env
    
    # Docker 构建（添加重试机制）
    MAX_RETRIES=3
    RETRY_COUNT=0
    until docker build . -t selected_ai_image || [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; do
        echo "Docker build 失败，正在重试 (\$((RETRY_COUNT+1))/\$MAX_RETRIES)..."
        RETRY_COUNT=\$((RETRY_COUNT+1))
        sleep 5
    done
    
    if [ \$RETRY_COUNT -eq \$MAX_RETRIES ]; then
        echo "Docker build 失败，已达到最大重试次数"
        exit 1
    fi
    
    # Docker 运行
    docker rm -f selected_ai_app || true
    docker run --network \$NETWORK_NAME \
        -d \
        -p 3000:3000 \
        --name selected_ai_app \
        selected_ai_image
    
    # 数据库迁移
    sleep 5  # 等待容器完全启动
    docker exec selected_ai_app npx prisma migrate deploy
    
    echo "部署完成！"
EOF

title '部署成功'