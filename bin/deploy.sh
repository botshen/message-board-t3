USER='blog'
SERVER='1.94.239.72'
DEPLOY_PATH="/home/$USER/app"

function title {
  echo
  echo "###############################################################################"
  echo "## $1"
  echo "###############################################################################"
  echo
}

# 打包到 temp/repo.tar.gz
mkdir -p temp
title '压缩文件'
tar --exclude='./.git' \
    --exclude=".next*" \
    --exclude='./node_modules' \
    --exclude='./temp' \
    --exclude='./prisma/db.sqlite' \
    --exclude='./prisma/db.sqlite-journal' \
    -zcf temp/repo.tar.gz .

title '创建部署目录'
ssh $USER@$SERVER "mkdir -p $DEPLOY_PATH"

title '上传文件'
scp -q temp/repo.tar.gz $USER@$SERVER:$DEPLOY_PATH/repo.tar.gz

title '删除本地临时目录'
rm -rf temp

title '上传完成'
