#!/usr/bin/env bash

mvn clean package

echo 'Copy files >>>>'

scp -i /Users/morlakDzuu/.ssh/id_rsa \
    target/demo-0.0.1-SNAPSHOT.jar \
    morlak@178.154.210.140:/home/morlak/spring

echo 'Restart server >>>>>'

ssh -i /Users/morlakDzuu/.ssh/id_rsa morlak@178.154.210.140 << EOF

pgrep java | xargs kill -9
cd spring
rm log.txt
nohup java -jar demo-0.0.1-SNAPSHOT.jar > log.txt &

EOF

echo 'Goodbye))'