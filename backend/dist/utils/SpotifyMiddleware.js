export const validateSpotifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Spotify token is missing" });
    }
    next();
};
//# sourceMappingURL=SpotifyMiddleware.js.map