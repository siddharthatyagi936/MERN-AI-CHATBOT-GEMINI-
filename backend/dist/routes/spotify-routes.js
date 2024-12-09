import { fetchUserTopTracks } from "../controllers/SpotifyControllers.js";
import { validateSpotifyToken } from "../utils/SpotifyMiddleware.js";
import express from "express";
const songRoutes = express.Router();
songRoutes.get("/top-tracks", validateSpotifyToken, fetchUserTopTracks);
export default songRoutes;
//# sourceMappingURL=spotify-routes.js.map