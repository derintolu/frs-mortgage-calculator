<?php
/**
 * Plugin Name: FRS Mortgage Calculator
 * Plugin URI: https://myhub21.com
 * Description: Embeddable mortgage calculator widget with lead capture - can be shared on external websites. Includes 7 calculator blocks for the WordPress block editor.
 * Version: 1.1.0
 * Author: Derin Tolu / FRS Brand Experience Teams
 * Author URI: https://myhub21.com
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: frs-mortgage-calculator
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.1
 * Network: true
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Plugin constants.
define( 'FRS_MC_VERSION', '1.1.0' );
define( 'FRS_MC_DIR', plugin_dir_path( __FILE__ ) );
define( 'FRS_MC_URL', plugin_dir_url( __FILE__ ) );
define( 'FRS_MC_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Initialize the plugin.
 *
 * @return Plugin
 */
function init(): Plugin {
	require_once FRS_MC_DIR . 'includes/class-plugin.php';
	return Plugin::get_instance();
}

// Initialize on plugins_loaded to ensure all dependencies are available.
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );

/**
 * Plugin activation hook.
 */
function activate(): void {
	// Flush rewrite rules on activation.
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, __NAMESPACE__ . '\\activate' );

/**
 * Plugin deactivation hook.
 */
function deactivate(): void {
	// Flush rewrite rules on deactivation.
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, __NAMESPACE__ . '\\deactivate' );
