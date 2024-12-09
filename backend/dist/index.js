import app from "./app.js";
import { connectToDatabase } from "./db/connection.js";
//connections and listeners
const PORT = process.env.PORT || 5000;
connectToDatabase()
    .then(() => {
    app.listen(PORT, () => console.log("Server Open & Connected to Database"));
})
    .catch((err) => console.log(err));
//# sourceMappingURL=index.js.map