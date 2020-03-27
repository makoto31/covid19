docker start covid19
docker exec -it covid19 /bin/bash -c "cd /www/src; exec ${SHELL:-sh}"
docker stop covid19
