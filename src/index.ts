import app from "./app.ts";
import connectDB from "./config/database.ts";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});