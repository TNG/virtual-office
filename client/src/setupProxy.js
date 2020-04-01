const { createProxyMiddleware } = require("http-proxy-middleware");

const backendUrl = process.env.REACT_APP_BACKEND_API;

function proxy(app, route, changeOrigin) {
  app.use(
    route,
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin,
    })
  );
}

module.exports = function (app) {
  proxy(app, "/auth", true);
  proxy(app, "/logout", true);
  proxy(app, "/api", false);
  proxy(app, "/api-docs", true);
};
