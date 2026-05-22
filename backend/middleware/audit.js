const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const insertAudit = db.prepare(`
  INSERT INTO audit_log (id, user_id, user_email, action, resource, resource_id, school_id, ip, details)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

function audit(action, resource) {
  return (req, res, next) => {
    const orig = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400) {
        try {
          insertAudit.run(
            uuidv4(),
            req.user?.id || null,
            req.user?.email || null,
            action,
            resource,
            body?.id || req.params?.id || null,
            req.user?.school_id || null,
            req.ip,
            JSON.stringify({ params: req.params, query: req.query }).slice(0, 500)
          );
        } catch (e) { /* audit failures must never break the main request */ }
      }
      return orig(body);
    };
    next();
  };
}

module.exports = { audit };
