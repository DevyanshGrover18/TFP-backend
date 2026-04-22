import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config({quiet : true});

const algo = process.env.ALGO;
const key = Buffer.from(process.env.KEY, "hex")
const iv = Buffer.from(process.env.IV, "hex")

console.log("KEY length:", Buffer.from(process.env.KEY, "hex").length);  // must be 32
console.log("IV length:", Buffer.from(process.env.IV, "hex").length);    // must be 16
console.log("ALGO:", process.env.ALGO); // must be aes-256-cbc

export function encrypt(text) {
  const cipher = crypto.createCipheriv(algo, key, iv);
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
}

export function decrypt(text) {
  const decipher = crypto.createDecipheriv(algo, key, iv);
  return decipher.update(text, "hex", "utf8") + decipher.final("utf8");
}