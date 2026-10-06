export default function wrapAsync(fn) {
    return async (c, next) => {
        try {
            return await fn(c, next);
        }
        catch (error) {
            throw error;
        }
    };
}
