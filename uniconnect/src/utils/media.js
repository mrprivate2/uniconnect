import API_BASE_URL from "../api";

const IMG_BASE_URL = API_BASE_URL.replace("/api", "");

/**
 * Standardizes media URLs. 
 * If the path is a full URL (Supabase), it returns it as is.
 * If it's a relative path, it prepends the backend base URL.
 * Also handles fallback for avatars.
 */
export const getMediaUrl = (path, type = "post", username = "user") => {
  if (!path || path === "" || path === "null" || path === "undefined") {
    if (type === "avatar") {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    }
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  // Ensure path starts with a slash and base URL doesn't end with one
  const safePath = path.startsWith("/") ? path : `/${path}`;
  const safeBase = IMG_BASE_URL.endsWith("/") ? IMG_BASE_URL.slice(0, -1) : IMG_BASE_URL;
  
  return `${safeBase}${safePath}`;
};
