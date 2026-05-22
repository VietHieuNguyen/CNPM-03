const mongoose = require("mongoose");
const MONGO_URL = "mongodb://localhost:27017/manga_store";
mongoose.connect(MONGO_URL).then(async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log("Collections:", collections.map(c => c.name));
  for (const c of collections) {
    const count = await mongoose.connection.db.collection(c.name).countDocuments();
    console.log(`Collection ${c.name} has ${count} documents`);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
