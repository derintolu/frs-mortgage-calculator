<?php
/**
 * Admin settings page class.
 *
 * @package FRSMortgageCalculator
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Settings class - handles admin settings page using WordPress Settings API.
 */
class Settings {

	/**
	 * Option prefix.
	 *
	 * @var string
	 */
	const OPTION_PREFIX = 'frs_mc_';

	/**
	 * Settings page slug.
	 *
	 * @var string
	 */
	const PAGE_SLUG = 'frs-mortgage-calculator';

	/**
	 * Settings group name.
	 *
	 * @var string
	 */
	const SETTINGS_GROUP = 'frs_mc_settings';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'admin_menu', [ $this, 'add_settings_page' ] );
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
	}

	/**
	 * Add settings page under Settings menu.
	 */
	public function add_settings_page(): void {
		add_options_page(
			__( 'Mortgage Calculator', 'frs-mortgage-calculator' ),
			__( 'Mortgage Calculator', 'frs-mortgage-calculator' ),
			'manage_options',
			self::PAGE_SLUG,
			[ $this, 'render_settings_page' ]
		);
	}

	/**
	 * Register settings using WordPress Settings API.
	 */
	public function register_settings(): void {
		// Register settings.
		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_PREFIX . 'gradient_start',
			[
				'type'              => 'string',
				'sanitize_callback' => [ $this, 'sanitize_hex_color' ],
				'default'           => '#2563eb',
			]
		);

		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_PREFIX . 'gradient_end',
			[
				'type'              => 'string',
				'sanitize_callback' => [ $this, 'sanitize_hex_color' ],
				'default'           => '#2dd4da',
			]
		);

		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_PREFIX . 'default_user_id',
			[
				'type'              => 'integer',
				'sanitize_callback' => 'absint',
				'default'           => 0,
			]
		);

		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_PREFIX . 'show_lead_form',
			[
				'type'              => 'boolean',
				'sanitize_callback' => 'rest_sanitize_boolean',
				'default'           => true,
			]
		);

		register_setting(
			self::SETTINGS_GROUP,
			self::OPTION_PREFIX . 'webhook_url',
			[
				'type'              => 'string',
				'sanitize_callback' => 'esc_url_raw',
				'default'           => '',
			]
		);

		// Add settings section.
		add_settings_section(
			'frs_mc_appearance',
			__( 'Appearance', 'frs-mortgage-calculator' ),
			[ $this, 'render_appearance_section' ],
			self::PAGE_SLUG
		);

		add_settings_section(
			'frs_mc_defaults',
			__( 'Default Settings', 'frs-mortgage-calculator' ),
			[ $this, 'render_defaults_section' ],
			self::PAGE_SLUG
		);

		add_settings_section(
			'frs_mc_integration',
			__( 'Integration', 'frs-mortgage-calculator' ),
			[ $this, 'render_integration_section' ],
			self::PAGE_SLUG
		);

		// Add settings fields - Appearance.
		add_settings_field(
			'frs_mc_gradient_start',
			__( 'Gradient Start Color', 'frs-mortgage-calculator' ),
			[ $this, 'render_color_field' ],
			self::PAGE_SLUG,
			'frs_mc_appearance',
			[
				'label_for'   => self::OPTION_PREFIX . 'gradient_start',
				'description' => __( 'Primary color used for gradients and accents.', 'frs-mortgage-calculator' ),
				'default'     => '#2563eb',
			]
		);

		add_settings_field(
			'frs_mc_gradient_end',
			__( 'Gradient End Color', 'frs-mortgage-calculator' ),
			[ $this, 'render_color_field' ],
			self::PAGE_SLUG,
			'frs_mc_appearance',
			[
				'label_for'   => self::OPTION_PREFIX . 'gradient_end',
				'description' => __( 'Secondary color used for gradients.', 'frs-mortgage-calculator' ),
				'default'     => '#2dd4da',
			]
		);

		// Add settings fields - Defaults.
		add_settings_field(
			'frs_mc_default_user_id',
			__( 'Default Loan Officer', 'frs-mortgage-calculator' ),
			[ $this, 'render_user_select_field' ],
			self::PAGE_SLUG,
			'frs_mc_defaults',
			[
				'label_for'   => self::OPTION_PREFIX . 'default_user_id',
				'description' => __( 'Default loan officer to display. If set to 0, will use the current logged-in user.', 'frs-mortgage-calculator' ),
			]
		);

		add_settings_field(
			'frs_mc_show_lead_form',
			__( 'Show Lead Form', 'frs-mortgage-calculator' ),
			[ $this, 'render_checkbox_field' ],
			self::PAGE_SLUG,
			'frs_mc_defaults',
			[
				'label_for'   => self::OPTION_PREFIX . 'show_lead_form',
				'description' => __( 'Show email/share buttons by default on calculators.', 'frs-mortgage-calculator' ),
			]
		);

		// Add settings fields - Integration.
		add_settings_field(
			'frs_mc_webhook_url',
			__( 'Webhook URL', 'frs-mortgage-calculator' ),
			[ $this, 'render_url_field' ],
			self::PAGE_SLUG,
			'frs_mc_integration',
			[
				'label_for'   => self::OPTION_PREFIX . 'webhook_url',
				'description' => __( 'Global webhook URL for lead submissions. Receives POST requests with lead data.', 'frs-mortgage-calculator' ),
			]
		);
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook Current admin page hook.
	 */
	public function enqueue_admin_assets( string $hook ): void {
		if ( 'settings_page_' . self::PAGE_SLUG !== $hook ) {
			return;
		}

		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'wp-color-picker' );

		wp_add_inline_script(
			'wp-color-picker',
			'jQuery(document).ready(function($) { $(".frs-mc-color-picker").wpColorPicker(); });'
		);
	}

	/**
	 * Sanitize hex color.
	 *
	 * @param string $color Color value.
	 * @return string
	 */
	public function sanitize_hex_color( string $color ): string {
		if ( '' === $color ) {
			return '';
		}

		// 3 or 6 hex digits, or the empty string.
		if ( preg_match( '|^#([A-Fa-f0-9]{3}){1,2}$|', $color ) ) {
			return $color;
		}

		return '';
	}

	/**
	 * Render the appearance section description.
	 */
	public function render_appearance_section(): void {
		echo '<p>' . esc_html__( 'Customize the look and feel of the mortgage calculators.', 'frs-mortgage-calculator' ) . '</p>';
	}

	/**
	 * Render the defaults section description.
	 */
	public function render_defaults_section(): void {
		echo '<p>' . esc_html__( 'Configure default settings for calculator blocks.', 'frs-mortgage-calculator' ) . '</p>';
	}

	/**
	 * Render the integration section description.
	 */
	public function render_integration_section(): void {
		echo '<p>' . esc_html__( 'Configure external integrations and webhooks.', 'frs-mortgage-calculator' ) . '</p>';
	}

	/**
	 * Render a color picker field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_color_field( array $args ): void {
		$option_name = $args['label_for'];
		$value       = get_option( $option_name, $args['default'] ?? '' );
		$description = $args['description'] ?? '';

		printf(
			'<input type="text" id="%1$s" name="%1$s" value="%2$s" class="frs-mc-color-picker" data-default-color="%3$s">',
			esc_attr( $option_name ),
			esc_attr( $value ),
			esc_attr( $args['default'] ?? '' )
		);

		if ( $description ) {
			printf( '<p class="description">%s</p>', esc_html( $description ) );
		}
	}

	/**
	 * Render a user select field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_user_select_field( array $args ): void {
		$option_name = $args['label_for'];
		$value       = get_option( $option_name, 0 );
		$description = $args['description'] ?? '';

		// Get loan officers (users with loan_officer role or all users as fallback).
		$users = get_users( [
			'role__in' => [ 'loan_officer', 'administrator', 'editor' ],
			'orderby'  => 'display_name',
			'order'    => 'ASC',
		] );

		echo '<select id="' . esc_attr( $option_name ) . '" name="' . esc_attr( $option_name ) . '">';
		echo '<option value="0"' . selected( $value, 0, false ) . '>' . esc_html__( 'Current User (default)', 'frs-mortgage-calculator' ) . '</option>';

		foreach ( $users as $user ) {
			printf(
				'<option value="%d"%s>%s (%s)</option>',
				$user->ID,
				selected( $value, $user->ID, false ),
				esc_html( $user->display_name ),
				esc_html( $user->user_email )
			);
		}

		echo '</select>';

		if ( $description ) {
			printf( '<p class="description">%s</p>', esc_html( $description ) );
		}
	}

	/**
	 * Render a checkbox field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_checkbox_field( array $args ): void {
		$option_name = $args['label_for'];
		$value       = get_option( $option_name, true );
		$description = $args['description'] ?? '';

		printf(
			'<input type="checkbox" id="%1$s" name="%1$s" value="1" %2$s>',
			esc_attr( $option_name ),
			checked( $value, true, false )
		);

		if ( $description ) {
			printf( '<label for="%s"> %s</label>', esc_attr( $option_name ), esc_html( $description ) );
		}
	}

	/**
	 * Render a URL field.
	 *
	 * @param array $args Field arguments.
	 */
	public function render_url_field( array $args ): void {
		$option_name = $args['label_for'];
		$value       = get_option( $option_name, '' );
		$description = $args['description'] ?? '';

		printf(
			'<input type="url" id="%1$s" name="%1$s" value="%2$s" class="regular-text" placeholder="https://">',
			esc_attr( $option_name ),
			esc_attr( $value )
		);

		if ( $description ) {
			printf( '<p class="description">%s</p>', esc_html( $description ) );
		}
	}

	/**
	 * Render the settings page.
	 */
	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Show save message.
		if ( isset( $_GET['settings-updated'] ) ) {
			add_settings_error(
				'frs_mc_messages',
				'frs_mc_message',
				__( 'Settings saved.', 'frs-mortgage-calculator' ),
				'updated'
			);
		}

		settings_errors( 'frs_mc_messages' );
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>

			<div class="frs-mc-admin-header" style="background: linear-gradient(135deg, <?php echo esc_attr( get_option( self::OPTION_PREFIX . 'gradient_start', '#2563eb' ) ); ?> 0%, <?php echo esc_attr( get_option( self::OPTION_PREFIX . 'gradient_end', '#2dd4da' ) ); ?> 100%); padding: 20px; border-radius: 8px; margin: 20px 0; color: white;">
				<h2 style="margin: 0 0 10px; color: white;"><?php esc_html_e( 'FRS Mortgage Calculator', 'frs-mortgage-calculator' ); ?></h2>
				<p style="margin: 0; opacity: 0.9;"><?php esc_html_e( 'Configure default settings for your mortgage calculator blocks.', 'frs-mortgage-calculator' ); ?></p>
			</div>

			<form action="options.php" method="post">
				<?php
				settings_fields( self::SETTINGS_GROUP );
				do_settings_sections( self::PAGE_SLUG );
				submit_button( __( 'Save Settings', 'frs-mortgage-calculator' ) );
				?>
			</form>

			<div class="frs-mc-blocks-info" style="background: #f0f6fc; border: 1px solid #c8d6e5; padding: 20px; border-radius: 8px; margin-top: 30px;">
				<h3 style="margin-top: 0;"><?php esc_html_e( 'Available Calculator Blocks', 'frs-mortgage-calculator' ); ?></h3>
				<p><?php esc_html_e( 'The following calculator blocks are available in the block editor:', 'frs-mortgage-calculator' ); ?></p>
				<ul style="list-style: disc; margin-left: 20px;">
					<li><strong><?php esc_html_e( 'Payment Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Monthly payment breakdown', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'Affordability Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Max home price by income', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'Buydown Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Rate buydown schedules', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'DSCR Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Investment property DSCR', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'Refinance Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Refinance savings analysis', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'Net Proceeds Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Home sale proceeds', 'frs-mortgage-calculator' ); ?></li>
					<li><strong><?php esc_html_e( 'Rent vs Buy Calculator', 'frs-mortgage-calculator' ); ?></strong> - <?php esc_html_e( 'Rent vs buy comparison', 'frs-mortgage-calculator' ); ?></li>
				</ul>
				<p style="margin-bottom: 0;"><?php esc_html_e( 'Look for these blocks under the "FRS Calculators" category in the block inserter.', 'frs-mortgage-calculator' ); ?></p>
			</div>
		</div>
		<?php
	}

	/**
	 * Get an option value with default fallback.
	 *
	 * @param string $key     Option key (without prefix).
	 * @param mixed  $default Default value.
	 * @return mixed
	 */
	public static function get_option( string $key, $default = null ) {
		return get_option( self::OPTION_PREFIX . $key, $default );
	}
}
