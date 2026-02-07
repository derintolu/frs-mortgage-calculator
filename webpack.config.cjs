/**
 * Webpack config for editor block scripts.
 *
 * Uses @wordpress/scripts defaults, overriding only the entry point.
 * Vite handles the frontend widget separately (vite.config.js).
 */
const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		'blocks/index': path.resolve( __dirname, 'src/blocks/index.js' ),
	},
};
