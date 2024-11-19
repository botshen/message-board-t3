function title {
  echo
  echo "###############################################################################"
  echo "## $1"
  echo "###############################################################################"
  echo
}

title '创建共享目录'
mkdir -p /home/$USER/shared
title '创建环境变量文件'
touch /home/$USER/shared/.env
cd /home/$USER/releases/$TIME/
tar -zxf repo.tar.gz && rm repo.tar.gz
cp /home/$USER/shared/.env /home/$USER/releases/$TIME/.env
docker build . -t selected_ai_image &&
  (
    docker rm -f selected_ai_app
    docker run --network 20240323-153212_app-network -d -p 3000:3000 --name selected_ai_app selected_ai_image
  )
