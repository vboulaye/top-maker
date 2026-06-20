
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/private';
 * 
 * console.log(ENVIRONMENT); // => "production"
 * console.log(PUBLIC_BASE_URL); // => throws error during build
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/private' {
	export const NODE_ENV: string;
	export const VTE_VERSION: string;
	export const PNPM_HOME: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const LC_PAPER: string;
	export const npm_command: string;
	export const QTWEBENGINE_DICTIONARIES_PATH: string;
	export const npm_config_global_prefix: string;
	export const _P9K_SSH_TTY: string;
	export const __MISE_SESSION: string;
	export const COLOR: string;
	export const TERMINATOR_DBUS_NAME: string;
	export const GOROOT: string;
	export const OPENCODE_RUN_ID: string;
	export const SYSTEMD_EXEC_PID: string;
	export const GOBIN: string;
	export const SSH_AUTH_SOCK: string;
	export const XDG_SEAT_PATH: string;
	export const CLUTTER_IM_MODULE: string;
	export const XCURSOR_THEME: string;
	export const MANAGERPID: string;
	export const OPENCODE_PROCESS_ROLE: string;
	export const LESS_TERMCAP_us: string;
	export const GREP_COLORS: string;
	export const npm_config_noproxy: string;
	export const PAGER: string;
	export const INIT_CWD: string;
	export const http_proxy: string;
	export const GTK2_RC_FILES: string;
	export const QT_AUTO_SCREEN_SCALE_FACTOR: string;
	export const KDE_SESSION_VERSION: string;
	export const XDG_DATA_DIRS: string;
	export const LD_LIBRARY_PATH: string;
	export const LESS_TERMCAP_mb: string;
	export const XDG_VTNR: string;
	export const JOURNAL_STREAM: string;
	export const npm_config_userconfig: string;
	export const XDG_SESSION_TYPE: string;
	export const COLORTERM: string;
	export const npm_config_user_agent: string;
	export const __MISE_DIFF: string;
	export const PAM_KWALLET5_LOGIN: string;
	export const OPENCODE: string;
	export const GPG_AGENT_INFO: string;
	export const XDG_SEAT: string;
	export const SSH_ASKPASS: string;
	export const npm_package_version: string;
	export const LANGUAGE: string;
	export const npm_package_json: string;
	export const FZF_CTRL_T_COMMAND: string;
	export const P9K_TTY: string;
	export const OPENCODE_PID: string;
	export const GITLAB_HOST: string;
	export const QT_IM_MODULE: string;
	export const OLDPWD: string;
	export const LC_NUMERIC: string;
	export const GTK_RC_FILES: string;
	export const DESKTOP_SESSION: string;
	export const TERMINATOR_DBUS_PATH: string;
	export const SHLVL: string;
	export const LESS_TERMCAP_md: string;
	export const npm_node_execpath: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const MAVEN_HOME: string;
	export const DISPLAY: string;
	export const SVELTEKIT_FORK: string;
	export const TERMINATOR_UUID: string;
	export const GREP_COLOR: string;
	export const LESS_TERMCAP_ue: string;
	export const XDG_CONFIG_DIRS: string;
	export const NIX_PROFILES: string;
	export const IM_CONFIG_PHASE: string;
	export const RUSTUP_TOOLCHAIN: string;
	export const P9K_SSH: string;
	export const LC_ADDRESS: string;
	export const KDE_SESSION_UID: string;
	export const HOME: string;
	export const __MISE_ORIG_PATH: string;
	export const KDE_APPLICATIONS_AS_SCOPE: string;
	export const GSM_SKIP_SSH_AGENT_WORKAROUND: string;
	export const GTK_IM_MODULE: string;
	export const GTK_MODULES: string;
	export const LC_IDENTIFICATION: string;
	export const INVOCATION_ID: string;
	export const MISE_SHELL: string;
	export const LC_MONETARY: string;
	export const npm_config_prefix: string;
	export const XAUTHORITY: string;
	export const npm_config_npm_version: string;
	export const XDG_SESSION_CLASS: string;
	export const XDG_SESSION_ID: string;
	export const RUSTUP_HOME: string;
	export const npm_config_node_gyp: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const LOGNAME: string;
	export const SHELL: string;
	export const USER: string;
	export const FZF_ALT_C_OPTS: string;
	export const PATH: string;
	export const LC_TIME: string;
	export const ICEAUTHORITY: string;
	export const AGENT: string;
	export const SESSION_MANAGER: string;
	export const TERM: string;
	export const npm_config_cache: string;
	export const NODE: string;
	export const SSH_AGENT_PID: string;
	export const npm_config_local_prefix: string;
	export const npm_package_name: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const ftp_proxy: string;
	export const KDE_FULL_SESSION: string;
	export const XDG_RUNTIME_DIR: string;
	export const LANG: string;
	export const LC_MEASUREMENT: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const EDITOR: string;
	export const LC_TELEPHONE: string;
	export const XMODIFIERS: string;
	export const npm_config_ignore_scripts: string;
	export const XDG_SESSION_DESKTOP: string;
	export const LS_COLORS: string;
	export const XCURSOR_SIZE: string;
	export const npm_lifecycle_script: string;
	export const KRB5CCNAME: string;
	export const LC_NAME: string;
	export const npm_lifecycle_event: string;
	export const QT_ACCESSIBILITY: string;
	export const npm_config_init_module: string;
	export const NIX_SSL_CERT_FILE: string;
	export const https_proxy: string;
	export const VIRTUAL_ENV: string;
	export const _P9K_TTY: string;
	export const XDG_SESSION_PATH: string;
	export const npm_execpath: string;
	export const npm_config_globalconfig: string;
	export const JAVA_HOME: string;
	export const PWD: string;
	export const LESS_TERMCAP_me: string;
	export const CARGO_HOME: string;
}

/**
 * This module provides access to environment variables that are injected _statically_ into your bundle at build time and are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Static environment variables are [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env` at build time and then statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * For example, given the following build time environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { ENVIRONMENT, PUBLIC_BASE_URL } from '$env/static/public';
 * 
 * console.log(ENVIRONMENT); // => throws error during build
 * console.log(PUBLIC_BASE_URL); // => "http://site.com"
 * ```
 * 
 * The above values will be the same _even if_ different values for `ENVIRONMENT` or `PUBLIC_BASE_URL` are set at runtime, as they are statically replaced in your code with their build time values.
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are limited to _private_ access.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Private_ access:**
 * 
 * - This module cannot be imported into client-side code
 * - This module includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured)
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://site.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * 
 * console.log(env.ENVIRONMENT); // => "production"
 * console.log(env.PUBLIC_BASE_URL); // => undefined
 * ```
 */
declare module '$env/dynamic/private' {
	export const env: {
		NODE_ENV: string;
		VTE_VERSION: string;
		PNPM_HOME: string;
		MEMORY_PRESSURE_WRITE: string;
		LC_PAPER: string;
		npm_command: string;
		QTWEBENGINE_DICTIONARIES_PATH: string;
		npm_config_global_prefix: string;
		_P9K_SSH_TTY: string;
		__MISE_SESSION: string;
		COLOR: string;
		TERMINATOR_DBUS_NAME: string;
		GOROOT: string;
		OPENCODE_RUN_ID: string;
		SYSTEMD_EXEC_PID: string;
		GOBIN: string;
		SSH_AUTH_SOCK: string;
		XDG_SEAT_PATH: string;
		CLUTTER_IM_MODULE: string;
		XCURSOR_THEME: string;
		MANAGERPID: string;
		OPENCODE_PROCESS_ROLE: string;
		LESS_TERMCAP_us: string;
		GREP_COLORS: string;
		npm_config_noproxy: string;
		PAGER: string;
		INIT_CWD: string;
		http_proxy: string;
		GTK2_RC_FILES: string;
		QT_AUTO_SCREEN_SCALE_FACTOR: string;
		KDE_SESSION_VERSION: string;
		XDG_DATA_DIRS: string;
		LD_LIBRARY_PATH: string;
		LESS_TERMCAP_mb: string;
		XDG_VTNR: string;
		JOURNAL_STREAM: string;
		npm_config_userconfig: string;
		XDG_SESSION_TYPE: string;
		COLORTERM: string;
		npm_config_user_agent: string;
		__MISE_DIFF: string;
		PAM_KWALLET5_LOGIN: string;
		OPENCODE: string;
		GPG_AGENT_INFO: string;
		XDG_SEAT: string;
		SSH_ASKPASS: string;
		npm_package_version: string;
		LANGUAGE: string;
		npm_package_json: string;
		FZF_CTRL_T_COMMAND: string;
		P9K_TTY: string;
		OPENCODE_PID: string;
		GITLAB_HOST: string;
		QT_IM_MODULE: string;
		OLDPWD: string;
		LC_NUMERIC: string;
		GTK_RC_FILES: string;
		DESKTOP_SESSION: string;
		TERMINATOR_DBUS_PATH: string;
		SHLVL: string;
		LESS_TERMCAP_md: string;
		npm_node_execpath: string;
		FZF_DEFAULT_COMMAND: string;
		MAVEN_HOME: string;
		DISPLAY: string;
		SVELTEKIT_FORK: string;
		TERMINATOR_UUID: string;
		GREP_COLOR: string;
		LESS_TERMCAP_ue: string;
		XDG_CONFIG_DIRS: string;
		NIX_PROFILES: string;
		IM_CONFIG_PHASE: string;
		RUSTUP_TOOLCHAIN: string;
		P9K_SSH: string;
		LC_ADDRESS: string;
		KDE_SESSION_UID: string;
		HOME: string;
		__MISE_ORIG_PATH: string;
		KDE_APPLICATIONS_AS_SCOPE: string;
		GSM_SKIP_SSH_AGENT_WORKAROUND: string;
		GTK_IM_MODULE: string;
		GTK_MODULES: string;
		LC_IDENTIFICATION: string;
		INVOCATION_ID: string;
		MISE_SHELL: string;
		LC_MONETARY: string;
		npm_config_prefix: string;
		XAUTHORITY: string;
		npm_config_npm_version: string;
		XDG_SESSION_CLASS: string;
		XDG_SESSION_ID: string;
		RUSTUP_HOME: string;
		npm_config_node_gyp: string;
		MEMORY_PRESSURE_WATCH: string;
		LOGNAME: string;
		SHELL: string;
		USER: string;
		FZF_ALT_C_OPTS: string;
		PATH: string;
		LC_TIME: string;
		ICEAUTHORITY: string;
		AGENT: string;
		SESSION_MANAGER: string;
		TERM: string;
		npm_config_cache: string;
		NODE: string;
		SSH_AGENT_PID: string;
		npm_config_local_prefix: string;
		npm_package_name: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		ftp_proxy: string;
		KDE_FULL_SESSION: string;
		XDG_RUNTIME_DIR: string;
		LANG: string;
		LC_MEASUREMENT: string;
		XDG_CURRENT_DESKTOP: string;
		EDITOR: string;
		LC_TELEPHONE: string;
		XMODIFIERS: string;
		npm_config_ignore_scripts: string;
		XDG_SESSION_DESKTOP: string;
		LS_COLORS: string;
		XCURSOR_SIZE: string;
		npm_lifecycle_script: string;
		KRB5CCNAME: string;
		LC_NAME: string;
		npm_lifecycle_event: string;
		QT_ACCESSIBILITY: string;
		npm_config_init_module: string;
		NIX_SSL_CERT_FILE: string;
		https_proxy: string;
		VIRTUAL_ENV: string;
		_P9K_TTY: string;
		XDG_SESSION_PATH: string;
		npm_execpath: string;
		npm_config_globalconfig: string;
		JAVA_HOME: string;
		PWD: string;
		LESS_TERMCAP_me: string;
		CARGO_HOME: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * This module provides access to environment variables set _dynamically_ at runtime and that are _publicly_ accessible.
 * 
 * |         | Runtime                                                                    | Build time                                                               |
 * | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
 * | Private | [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private) | [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private) |
 * | Public  | [`$env/dynamic/public`](https://svelte.dev/docs/kit/$env-dynamic-public)   | [`$env/static/public`](https://svelte.dev/docs/kit/$env-static-public)   |
 * 
 * Dynamic environment variables are defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`.
 * 
 * **_Public_ access:**
 * 
 * - This module _can_ be imported into client-side code
 * - **Only** variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`) are included
 * 
 * > [!NOTE] In `dev`, `$env/dynamic` includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 * 
 * > [!NOTE] To get correct types, environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * >
 * > ```env
 * > MY_FEATURE_FLAG=
 * > ```
 * >
 * > You can override `.env` values from the command line like so:
 * >
 * > ```sh
 * > MY_FEATURE_FLAG="enabled" npm run dev
 * > ```
 * 
 * For example, given the following runtime environment:
 * 
 * ```env
 * ENVIRONMENT=production
 * PUBLIC_BASE_URL=http://example.com
 * ```
 * 
 * With the default `publicPrefix` and `privatePrefix`:
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.ENVIRONMENT); // => undefined, not public
 * console.log(env.PUBLIC_BASE_URL); // => "http://example.com"
 * ```
 * 
 * ```
 * 
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
