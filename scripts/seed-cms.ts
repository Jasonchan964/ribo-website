import { getPayload } from "payload";
import config from "../src/payload.config";

const email = process.env.CMS_ADMIN_EMAIL ?? "admin@ribo.com";
const password = process.env.CMS_ADMIN_PASSWORD ?? "ChangeMe-Ribo-2026!";

const payload = await getPayload({ config });

const existing = await payload.find({
  collection: "users",
  limit: 1,
});

if (existing.totalDocs > 0) {
  console.log("CMS admin already exists — skipping user creation.");
} else {
  await payload.create({
    collection: "users",
    data: {
      email,
      password,
      name: "RIBO Admin",
    },
  });
  console.log(`Created CMS admin: ${email}`);
}

const products = await payload.find({ collection: "products", limit: 1 });

if (products.totalDocs === 0) {
  console.log(
    "No products in CMS yet. Open http://localhost:3000/admin to upload media and add products.",
  );
} else {
  console.log("CMS products found — frontend will use Payload data.");
}

process.exit(0);
