export default function UserActivityTracker(req, res, next) {
    if (req.session.user) {
        req.session.user.last_seen_at = Date.now();
    }
    next();
}