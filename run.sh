#!/bin/bash
node ./whatsapp-api/responseBot.js &
node ./server/server.js &
cd ./client && npm start &
sleep 5
echo "Still running services..."
jobs
wait
