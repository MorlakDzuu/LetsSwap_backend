#!/usr/bin/env bash

mvn clean package

pgrep java | xargs kill -9
nohup java -jar target/demo-0.0.1-SNAPSHOT.jar  > log.txt &

echo 'Goodbye))'