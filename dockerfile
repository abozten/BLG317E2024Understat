FROM nikolaik/python-nodejs:python3.11-nodejs20

WORKDIR /app

COPY . .

# Install Python dependencies
WORKDIR /app/CSVtoDB
RUN python3.11 -m pip install flask pymysql requests pandas numpy flask-cors

# Install Node.js dependencies
WORKDIR /app/WebServer/understat-app
RUN npm install

# Build Next.js app
RUN npm run build

EXPOSE 3000 5000

# Setup startup script
WORKDIR /app/WebServer
RUN echo '#!/bin/bash\n\
python3.11 api.py &\n\
cd understat-app && npm start' > start.sh
RUN chmod +x start.sh

CMD ["./start.sh"]