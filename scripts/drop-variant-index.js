import mongoose from "mongoose";
import "../config/dotenv.js";

await mongoose.connect(process.env.MONGO_URI);

const indexes = [
  "variants.id_1",
  "variants.sku_1",
  "variants.name_1",
  "variants.color_1",
  "variants.colorCode_1",
  "variants.mainImage_1",
];

for (const index of indexes) {
  try {
    const result = await mongoose.connection.db
      .collection("products")
      .dropIndex(index);
    console.log(`✅ Dropped index '${index}':`, result.ok === 1 ? "OK" : result);
  } catch (err) {
    if (err.code === 27) {
      console.log(`ℹ️  Index '${index}' does not exist — skipping.`);
    } else {
      console.error(`❌ Error dropping '${index}':`, err.message);
    }
  }
}

await mongoose.disconnect();
process.exit(0);
