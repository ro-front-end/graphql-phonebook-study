require("dotenv").config();

const PORT = process.env.PORT;
const MONGODB = process.env.MONGODB_URI;
const SECRET = process.env.SECRET;

module.exports = { PORT, MONGODB, SECRET };
