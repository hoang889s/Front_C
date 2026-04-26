// Kiểm tra môi trường có hỗ trợ localStorage không
const isBrowser = typeof window !== "undefined";
// GET
export const getItem = (key) => {
    try {
        if (!isBrowser) return null;

        const value = window.localStorage.getItem(key);
        console.log("[localStorage][GET]", key, value);

        // nếu không có thì trả null
        if (value === null) return null;

        // thử parse JSON
        try {
            return JSON.parse(value);
        } catch {
            // nếu không phải JSON thì trả string bình thường
            return value;
        }
    } catch (err) {
        console.error("localStorage GET error:", err);
        return null;
    }
};
// SET
export const setItem = (key, value) => {
    try {
        if (!isBrowser) return;

        // nếu là object thì stringify
        const data =
            typeof value === "object" ? JSON.stringify(value) : value;

        window.localStorage.setItem(key, data);
    } catch (err) {
        console.error("localStorage SET error:", err);
    }
};

// REMOVE
export const removeItem = (key) => {
    try {
        if (!isBrowser) return;
        window.localStorage.removeItem(key);
    } catch (err) {
        console.error("localStorage REMOVE error:", err);
    }
};
// CLEAR (optional)
export const clearStorage = () => {
    try {
        if (!isBrowser) return;
        window.localStorage.clear();
    } catch (err) {
        console.error("localStorage CLEAR error:", err);
    }
};