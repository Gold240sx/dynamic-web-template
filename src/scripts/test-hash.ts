import bcrypt from "bcryptjs";

const password = "admin123!@#";
const storedHash =
  "$2b$10$AR4HPqpkeaBgBKfbq25i1eHqZbkpZiLHLroOrAj9NR4cmLXSI05Ou";

async function main() {
  const newHash = await bcrypt.hash(password, 10);
  console.log("New hash:", newHash);

  const isValidNew = await bcrypt.compare(password, newHash);
  console.log("Is valid with new hash:", isValidNew);

  const isValidStored = await bcrypt.compare(password, storedHash);
  console.log("Is valid with stored hash:", isValidStored);
}

main().catch(console.error);
