# 这是用来在远程服务器执行 docker 的 selected_ai_app 容器的 npx prisma migrate deploy 的脚本
# 思路
# - 远程服务器的用户名是 selected_ai
# - 通过 ssh 命令在远程服务器上执行 docker exec -it selected_ai_app npx prisma migrate deploy

set -e # 如果有任何语句返回非零值，则退出脚本
USER='root'
SERVER='1.94.239.72'
ssh $USER@$SERVER "docker exec -it selected_ai_app npx prisma migrate deploy"
set +e # 取消
