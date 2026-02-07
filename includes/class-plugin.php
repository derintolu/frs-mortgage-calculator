<?php
/**
 * Main plugin orchestrator class.
 *
 * @package FRSMortgageCalculator
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin class - main orchestrator for the FRS Mortgage Calculator plugin.
 */
class Plugin {

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.1.0';

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static ?Plugin $instance = null;

	/**
	 * Settings instance.
	 *
	 * @var Settings|null
	 */
	private ?Settings $settings = null;

	/**
	 * Blocks instance.
	 *
	 * @var Blocks|null
	 */
	private ?Blocks $blocks = null;

	/**
	 * REST API instance.
	 *
	 * @var RestApi|null
	 */
	private ?RestApi $rest_api = null;

	/**
	 * Get the singleton instance.
	 *
	 * @return Plugin
	 */
	public static function get_instance(): Plugin {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Private constructor for singleton.
	 */
	private function __construct() {
		$this->load_dependencies();
		$this->init_components();
		$this->register_hooks();
	}

	/**
	 * Load required class files.
	 */
	private function load_dependencies(): void {
		require_once FRS_MC_DIR . 'includes/class-settings.php';
		require_once FRS_MC_DIR . 'includes/class-blocks.php';
		require_once FRS_MC_DIR . 'includes/class-rest-api.php';
	}

	/**
	 * Initialize component instances.
	 */
	private function init_components(): void {
		$this->settings = new Settings();
		$this->blocks   = new Blocks();
		$this->rest_api = new RestApi();
	}

	/**
	 * Register WordPress hooks.
	 */
	private function register_hooks(): void {
		// Legacy shortcode support for backwards compatibility.
		add_shortcode( 'frs_mortgage_calculator', [ $this, 'render_legacy_shortcode' ] );
		add_shortcode( 'frs_mortgage_calculator_embed', [ $this, 'render_embed_code' ] );

		// Enqueue assets for shortcodes.
		add_action( 'wp_enqueue_scripts', [ $this, 'maybe_enqueue_shortcode_assets' ] );

		// Add type="module" to our script.
		add_filter( 'script_loader_tag', [ $this, 'add_module_type' ], 10, 3 );

		// Register block category.
		add_filter( 'block_categories_all', [ $this, 'register_block_category' ], 10, 2 );
	}

	/**
	 * Register the FRS Calculators block category.
	 *
	 * @param array                    $categories Block categories.
	 * @param \WP_Block_Editor_Context $context    Block editor context.
	 * @return array
	 */
	public function register_block_category( array $categories, $context ): array {
		return array_merge(
			[
				[
					'slug'  => 'frs-calculators',
					'title' => __( 'FRS Calculators', 'frs-mortgage-calculator' ),
					'icon'  => 'calculator',
				],
			],
			$categories
		);
	}

	/**
	 * Add type="module" to our script tag for ES module support.
	 *
	 * @param string $tag    Script tag HTML.
	 * @param string $handle Script handle.
	 * @param string $src    Script source URL.
	 * @return string
	 */
	public function add_module_type( string $tag, string $handle, string $src ): string {
		// Only the frontend widget needs type="module" (Vite ES module output).
		// The editor script is a classic webpack bundle — must NOT be a module.
		if ( 'frs-mortgage-calculator' !== $handle ) {
			return $tag;
		}
		return str_replace( ' src=', ' type="module" src=', $tag );
	}

	/**
	 * Get widget asset URLs from the Vite manifest.
	 *
	 * @return array{js: string, css: string}
	 */
	public static function get_widget_assets(): array {
		$dist_dir      = FRS_MC_DIR . 'assets/dist/';
		$manifest_path = $dist_dir . 'manifest.json';

		$js_url  = '';
		$css_url = '';

		if ( file_exists( $manifest_path ) ) {
			$manifest = json_decode( file_get_contents( $manifest_path ), true );
			$entry    = $manifest['src/widget/main.tsx'] ?? null;

			if ( $entry ) {
				$js_url = FRS_MC_URL . 'assets/dist/' . $entry['file'];
				if ( ! empty( $entry['css'] ) ) {
					$css_url = FRS_MC_URL . 'assets/dist/' . $entry['css'][0];
				}
			}
		}

		return [ 'js' => $js_url, 'css' => $css_url ];
	}

	/**
	 * Enqueue assets for shortcodes if present on the page.
	 */
	public function maybe_enqueue_shortcode_assets(): void {
		global $post;

		if ( ! is_a( $post, 'WP_Post' ) ) {
			return;
		}

		$has_shortcode = has_shortcode( $post->post_content, 'frs_mortgage_calculator' ) ||
						 has_shortcode( $post->post_content, 'frs_mortgage_calculator_embed' );

		if ( ! $has_shortcode ) {
			return;
		}

		$this->enqueue_frontend_assets();
	}

	/**
	 * Enqueue frontend assets.
	 */
	public static function enqueue_frontend_assets(): void {
		$assets = self::get_widget_assets();

		if ( $assets['css'] ) {
			wp_enqueue_style( 'frs-mortgage-calculator', $assets['css'], [], self::VERSION );
		}

		if ( $assets['js'] ) {
			wp_enqueue_script( 'frs-mortgage-calculator', $assets['js'], [], self::VERSION, true );
		}
	}

	/**
	 * Get user data for widget.
	 *
	 * @param int $user_id WordPress user ID.
	 * @return array
	 */
	public static function get_user_data( int $user_id ): array {
		if ( ! $user_id ) {
			return [];
		}

		$user = get_user_by( 'id', $user_id );
		if ( ! $user ) {
			return [];
		}

		// Try to get profile data from frs-wp-users.
		$profile_data = [];
		if ( class_exists( 'FRSUsers\Models\Profile' ) ) {
			$profile = \FRSUsers\Models\Profile::get_by_user_id( $user_id );
			if ( $profile ) {
				$profile_data = $profile->toArray();
			}
		}

		$first_name = $profile_data['first_name'] ?? get_user_meta( $user_id, 'first_name', true );
		$last_name  = $profile_data['last_name'] ?? get_user_meta( $user_id, 'last_name', true );

		// Get avatar.
		$avatar = '';
		if ( ! empty( $profile_data['headshot_id'] ) ) {
			$avatar = wp_get_attachment_url( $profile_data['headshot_id'] );
		}
		if ( ! $avatar ) {
			$avatar = get_avatar_url( $user_id, [ 'size' => 200 ] );
		}

		return [
			'id'    => $user_id,
			'name'  => trim( $first_name . ' ' . $last_name ),
			'email' => $profile_data['email'] ?? $user->user_email,
			'phone' => $profile_data['mobile_number'] ?? $profile_data['phone_number'] ?? get_user_meta( $user_id, 'phone', true ),
			'nmls'  => $profile_data['nmls'] ?? $profile_data['nmls_number'] ?? get_user_meta( $user_id, 'nmls', true ),
			'title' => $profile_data['job_title'] ?? get_user_meta( $user_id, 'job_title', true ),
			'avatar' => $avatar,
		];
	}

	/**
	 * Render the legacy shortcode (backwards compatibility).
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function render_legacy_shortcode( $atts ): string {
		// Always enqueue assets when shortcode is rendered.
		self::enqueue_frontend_assets();

		$atts = shortcode_atts(
			[
				'user_id'        => 0,
				'show_lead_form' => 'true',
				'webhook_url'    => get_option( 'frs_mc_webhook_url', '' ),
				'gradient_start' => get_option( 'frs_mc_gradient_start', '#2563eb' ),
				'gradient_end'   => get_option( 'frs_mc_gradient_end', '#2dd4da' ),
			],
			$atts,
			'frs_mortgage_calculator'
		);

		// Determine user ID.
		$user_id = intval( $atts['user_id'] );
		if ( ! $user_id && isset( $_GET['loan_officer_id'] ) ) {
			$user_id = intval( $_GET['loan_officer_id'] );
		}
		if ( ! $user_id ) {
			$default_user_id = get_option( 'frs_mc_default_user_id', 0 );
			$user_id         = $default_user_id ? intval( $default_user_id ) : get_current_user_id();
		}

		$user_data = self::get_user_data( $user_id );

		// Build data attributes.
		$data_attrs = [
			'data-loan-officer-id'     => $user_id ?: '',
			'data-loan-officer-name'   => $user_data['name'] ?? '',
			'data-loan-officer-email'  => $user_data['email'] ?? '',
			'data-loan-officer-phone'  => $user_data['phone'] ?? '',
			'data-loan-officer-nmls'   => $user_data['nmls'] ?? '',
			'data-loan-officer-avatar' => $user_data['avatar'] ?? '',
			'data-webhook-url'         => $atts['webhook_url'],
			'data-show-lead-form'      => $atts['show_lead_form'],
			'data-gradient-start'      => $atts['gradient_start'],
			'data-gradient-end'        => $atts['gradient_end'],
			'data-api-url'             => rest_url( 'frs-mortgage-calculator/v1' ),
		];

		$attr_string = '';
		foreach ( $data_attrs as $key => $value ) {
			if ( '' !== $value ) {
				$attr_string .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $value ) );
			}
		}

		$unique_id = 'frs-mc-' . wp_unique_id();
		return '<div id="' . esc_attr( $unique_id ) . '" class="frs-mortgage-calculator-widget" data-frs-mortgage-calculator' . $attr_string . '></div>';
	}

	/**
	 * Render embed code for external sites.
	 *
	 * @param array $atts Shortcode attributes.
	 * @return string
	 */
	public function render_embed_code( $atts ): string {
		$atts = shortcode_atts(
			[
				'user_id'        => get_current_user_id(),
				'gradient_start' => get_option( 'frs_mc_gradient_start', '#2563eb' ),
				'gradient_end'   => get_option( 'frs_mc_gradient_end', '#2dd4da' ),
			],
			$atts,
			'frs_mortgage_calculator_embed'
		);

		$user_id   = intval( $atts['user_id'] );
		$user_data = self::get_user_data( $user_id );
		$assets    = self::get_widget_assets();

		$embed_code = sprintf(
			'<!-- FRS Mortgage Calculator Widget -->
<link rel="stylesheet" href="%s">
<div id="frs-mc-root"
     data-loan-officer-id="%d"
     data-loan-officer-name="%s"
     data-loan-officer-email="%s"
     data-loan-officer-phone="%s"
     data-loan-officer-nmls="%s"
     data-gradient-start="%s"
     data-gradient-end="%s"
     data-api-url="%s"
     data-show-lead-form="true">
</div>
<script type="module" src="%s"></script>',
			esc_url( $assets['css'] ),
			$user_id,
			esc_attr( $user_data['name'] ?? '' ),
			esc_attr( $user_data['email'] ?? '' ),
			esc_attr( $user_data['phone'] ?? '' ),
			esc_attr( $user_data['nmls'] ?? '' ),
			esc_attr( $atts['gradient_start'] ),
			esc_attr( $atts['gradient_end'] ),
			esc_url( rest_url( 'frs-mortgage-calculator/v1' ) ),
			esc_url( $assets['js'] )
		);

		ob_start();
		?>
		<div class="frs-embed-code-container" style="padding: 24px; background: #f9fafb; border-radius: 12px; margin: 20px 0;">
			<h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Embed Code for External Websites</h3>
			<p style="color: #6b7280; margin-bottom: 16px;">Copy and paste this code into any HTML page to display the mortgage calculator:</p>
			<div style="position: relative;">
				<pre style="background: #1f2937; color: #10b981; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; white-space: pre-wrap;"><code id="frs-embed-code"><?php echo esc_html( $embed_code ); ?></code></pre>
				<button
					onclick="navigator.clipboard.writeText(document.getElementById('frs-embed-code').textContent); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Code', 2000);"
					style="position: absolute; top: 8px; right: 8px; padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;"
				>
					Copy Code
				</button>
			</div>
			<div style="margin-top: 16px; padding: 16px; background: #eff6ff; border-radius: 8px;">
				<h4 style="font-weight: 600; color: #1e40af; margin-bottom: 8px;">Customization Options:</h4>
				<ul style="font-size: 14px; color: #1e3a8a; margin: 0; padding-left: 20px;">
					<li><code>data-gradient-start</code> - Primary color (hex, e.g., "#ff6b6b")</li>
					<li><code>data-gradient-end</code> - Secondary color (hex, e.g., "#feca57")</li>
					<li><code>data-show-lead-form</code> - "true" or "false" to show/hide lead capture</li>
					<li><code>data-webhook-url</code> - URL to receive lead submissions via POST</li>
				</ul>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}

	/**
	 * Get the settings instance.
	 *
	 * @return Settings
	 */
	public function get_settings(): Settings {
		return $this->settings;
	}

	/**
	 * Get the blocks instance.
	 *
	 * @return Blocks
	 */
	public function get_blocks(): Blocks {
		return $this->blocks;
	}

	/**
	 * Get the REST API instance.
	 *
	 * @return RestApi
	 */
	public function get_rest_api(): RestApi {
		return $this->rest_api;
	}
}
