const { format } = require("date-fns");
const { v4: uuid } = require("uuid");
const fs = require("fs");
const path = require("path");


const logEvents = async () => {
  const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
  const logItem = `${dateTime}\t${uuid}\t${message}\n`;

  try {
    if(!fs.existsSync(path.join(__dirname,'..','logs')))
  } catch (err) {
    console.log(err);
  }
};
