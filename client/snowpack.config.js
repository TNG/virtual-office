module.exports = {
  extends: "@snowpack/app-scripts-react",
  plugins: ["@snowpack/plugin-typescript"],

  devOptions: {
    port: 8080,
    src: "src",
    bundle: false,
    fallback: "index.html",
  },

  installOptions: {
    polyfillNode: true,
  },

  proxy: {
    "/auth": "http://localhost:9000/auth",
    "/logout": "http://localhost:9000/logout",
    //"/api": { target: "http://localhost:9000", ws: true },
  },
};
