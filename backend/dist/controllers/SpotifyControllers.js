const SPOTIFY_BASE_URL = "https://api.spotify.com";
let accessToken = "BQBIfX073j4FFM2yng6EkLkvtwWo7by21-xL3sFukougRKmcjfSMyLvnbO0M-Tjgq1xAP3PE3pjDqqIANtGz7Nr2-XwfDpORFOtsNlk7vQMoJCiXorPRARgjENs5VaPQrBU5u-T6m_LZGvV5Y9FtdgWVnLmFvMM2WI_IUzrRJBsYqDSXv8sz9HsEDzOiSG9CkZoC3k-as8RM3q2IchodI3uap7EV7N5F83k5xf95IocBTTl3TU-1dnnrlKCEWTzcChqcrQogWVjxAGI_RyNPJtd7mtlpnLmH";
export const fetchSpotifyApi = async (endpoint, method, body) => {
    const res = await fetch(`${SPOTIFY_BASE_URL}/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        method,
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(`Spotify API error: ${error.error.message}`);
    }
    return res.json();
};
export const fetchUserTopTracks = async (req, res) => {
    try {
        const topTracks = await getTopTracks();
        const formattedTracks = topTracks.map(({ name, artists }) => ({
            name,
            artists: artists.map((artist) => artist.name).join(", "),
        }));
        return res.status(200).json({ message: "Top Tracks Fetched", tracks: formattedTracks });
    }
    catch (error) {
        console.error("Error fetching top tracks:", error.message);
        return res.status(500).json({ message: "Failed to fetch top tracks" });
    }
};
export const getTopTracks = async () => {
    const endpoint = "v1/me/top/tracks?time_range=long_term&limit=5";
    return await fetchSpotifyApi(endpoint, "GET");
};
//# sourceMappingURL=SpotifyControllers.js.map