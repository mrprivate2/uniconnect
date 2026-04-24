let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Automatically append /api if the user forgot it in the env variable
if (API_URL && !API_URL.endsWith("/api") && !API_URL.endsWith("/api/")) {
    API_URL = API_URL.endsWith("/") ? `${API_URL}api` : `${API_URL}/api`;
}

const API_BASE_URL = API_URL;
export default API_BASE_URL;