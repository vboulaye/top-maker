export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.1UfyWTQO.js",app:"_app/immutable/entry/app.Cz4gq5mn.js",imports:["_app/immutable/entry/start.1UfyWTQO.js","_app/immutable/chunks/Doq7kaok.js","_app/immutable/chunks/DnKN8WAZ.js","_app/immutable/chunks/0mPQTNz6.js","_app/immutable/entry/app.Cz4gq5mn.js","_app/immutable/chunks/DnKN8WAZ.js","_app/immutable/chunks/kNaey6uv.js","_app/immutable/chunks/xihTtKlq.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
