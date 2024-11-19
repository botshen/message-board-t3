USER='blog'
SERVER='1.94.239.72'
TIME=$(date +%Y%m%d%H%M%S)
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
tar --exclude='./.git' --exclude='./.env*' --exclude=".next*" --exclude='./node_modules' --exclude='./temp' -zcf temp/repo.tar.gz .
title '上传文件'
ssh $USER@$SERVER "mkdir -p /home/$USER/releases/$TIME"
title '删除旧版本'
ssh $USER@$SERVER "cd /home/$USER/releases; ls -d */ | sort | head -n -3 | xargs -I {} rm -rf {}"
title '上传文件'
scp -q temp/repo.tar.gz $USER@$SERVER:/home/$USER/releases/$TIME/repo.tar.gz
title '解压文件'
ssh $USER@$SERVER "cd /home/$USER/releases/$TIME && tar -xzf repo.tar.gz && rm repo.tar.gz"
title '删除本地临时目录'
rm -rf temp
title '完成上传和解压'
