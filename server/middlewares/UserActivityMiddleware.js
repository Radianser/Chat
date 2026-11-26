import { db } from '#config/db_conn.js';

const lastUpdateCache = new Map();

export default async function UserActivityMiddleware(req, res, next) {
    if (req.session.user) {
        const now = Date.now();
        const lastUpdate = lastUpdateCache.get(req.session.user.id) || 0;
        
        if (now - lastUpdate > 60000) {
            req.session.user.last_seen_at = now;
            lastUpdateCache.set(req.session.user.id, now);
            try {
                await db.pg.query(
                    'UPDATE users SET last_seen_at = NOW() WHERE id = $1',
                    [req.session.user.id]
                );
            } catch (err) {
                console.error('Ошибка обновления last_seen_at:', err);
            }
        }
    }
    next();
}