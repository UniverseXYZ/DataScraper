FROM library/node

ADD package.json package.json
RUN npm install
ADD . .

CMD ["node","index.js"]
