<?php
/**
 * Block registration class.
 *
 * @package FRSMortgageCalculator
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Blocks class - handles registration of Gutenberg blocks.
 */
class Blocks {

	/**
	 * Block types to register.
	 *
	 * @var array
	 */
	private array $block_types = [
		'payment-calculator'      => [
			'title'           => 'Payment Calculator',
			'description'     => 'Monthly payment breakdown calculator',
			'calculator_type' => 'conventional',
		],
		'affordability-calculator' => [
			'title'           => 'Affordability Calculator',
			'description'     => 'Calculate max home price by income',
			'calculator_type' => 'affordability',
		],
		'buydown-calculator'      => [
			'title'           => 'Buydown Calculator',
			'description'     => 'Rate buydown schedule calculator',
			'calculator_type' => 'buydown',
		],
		'dscr-calculator'         => [
			'title'           => 'DSCR Calculator',
			'description'     => 'Investment property DSCR calculator',
			'calculator_type' => 'dscr',
		],
		'refinance-calculator'    => [
			'title'           => 'Refinance Calculator',
			'description'     => 'Refinance savings analysis',
			'calculator_type' => 'refinance',
		],
		'net-proceeds-calculator' => [
			'title'           => 'Net Proceeds Calculator',
			'description'     => 'Home sale proceeds calculator',
			'calculator_type' => 'netproceeds',
		],
		'rent-vs-buy-calculator'  => [
			'title'           => 'Rent vs Buy Calculator',
			'description'     => 'Rent vs buy comparison calculator',
			'calculator_type' => 'rentvsbuy',
		],
	];

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'register_blocks' ] );
	}

	/**
	 * Register all calculator blocks.
	 */
	public function register_blocks(): void {
		$this->register_editor_script();

		foreach ( $this->block_types as $block_name => $block_config ) {
			$this->register_block( $block_name, $block_config );
		}
	}

	/**
	 * Register the shared editor script for all calculator blocks.
	 */
	private function register_editor_script(): void {
		$asset_file = FRS_MC_DIR . 'build/blocks/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;

		wp_register_script(
			'frs-mortgage-calculator-editor',
			FRS_MC_URL . 'build/blocks/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);
	}

	/**
	 * Register a single block type.
	 *
	 * @param string $block_name   Block name (without namespace).
	 * @param array  $block_config Block configuration.
	 */
	private function register_block( string $block_name, array $block_config ): void {
		$block_dir = FRS_MC_DIR . 'blocks/' . $block_name;

		// Register block from block.json if it exists.
		if ( file_exists( $block_dir . '/block.json' ) ) {
			register_block_type(
				$block_dir,
				[
					'render_callback' => [ $this, 'render_block' ],
				]
			);
		} else {
			// Fallback: register block programmatically.
			register_block_type(
				'frs/' . $block_name,
				[
					'api_version'     => 3,
					'title'           => $block_config['title'],
					'description'     => $block_config['description'],
					'category'        => 'frs-calculators',
					'icon'            => 'calculator',
					'supports'        => [
						'html'  => false,
						'align' => [ 'wide', 'full' ],
					],
					'attributes'      => $this->get_block_attributes(),
					'render_callback' => [ $this, 'render_block' ],
				]
			);
		}
	}

	/**
	 * Get default block attributes.
	 *
	 * @return array
	 */
	private function get_block_attributes(): array {
		return [
			'userId'        => [
				'type'    => 'number',
				'default' => 0,
			],
			'showLeadForm'  => [
				'type'    => 'boolean',
				'default' => true,
			],
			'gradientStart' => [
				'type'    => 'string',
				'default' => '#2563eb',
			],
			'gradientEnd'   => [
				'type'    => 'string',
				'default' => '#2dd4da',
			],
			'webhookUrl'    => [
				'type'    => 'string',
				'default' => '',
			],
		];
	}

	/**
	 * Render a calculator block.
	 *
	 * @param array     $attributes Block attributes.
	 * @param string    $content    Block content.
	 * @param \WP_Block $block      Block instance.
	 * @return string
	 */
	public function render_block( array $attributes, string $content, \WP_Block $block ): string {
		// Enqueue frontend assets.
		Plugin::enqueue_frontend_assets();

		// Get block name to determine calculator type.
		$block_name      = $block->name;
		$calculator_type = $this->get_calculator_type_from_block_name( $block_name );

		// Merge attributes with defaults from settings.
		$user_id        = $attributes['userId'] ?? 0;
		$show_lead_form = $attributes['showLeadForm'] ?? Settings::get_option( 'show_lead_form', true );
		$gradient_start = $attributes['gradientStart'] ?? Settings::get_option( 'gradient_start', '#2563eb' );
		$gradient_end   = $attributes['gradientEnd'] ?? Settings::get_option( 'gradient_end', '#2dd4da' );
		$webhook_url    = $attributes['webhookUrl'] ?? Settings::get_option( 'webhook_url', '' );

		// Determine user ID.
		if ( ! $user_id && isset( $_GET['loan_officer_id'] ) ) {
			$user_id = intval( $_GET['loan_officer_id'] );
		}
		if ( ! $user_id ) {
			$default_user_id = Settings::get_option( 'default_user_id', 0 );
			$user_id         = $default_user_id ? intval( $default_user_id ) : get_current_user_id();
		}

		$user_data = Plugin::get_user_data( $user_id );

		// Generate unique ID for this block instance.
		$unique_id = 'frs-mc-' . wp_unique_id();

		// Build data attributes.
		$data_attrs = [
			'data-frs-mortgage-calculator' => '',
			'data-calculator-type'         => $calculator_type,
			'data-loan-officer-id'         => $user_id ?: '',
			'data-loan-officer-name'       => $user_data['name'] ?? '',
			'data-loan-officer-email'      => $user_data['email'] ?? '',
			'data-loan-officer-phone'      => $user_data['phone'] ?? '',
			'data-loan-officer-nmls'       => $user_data['nmls'] ?? '',
			'data-loan-officer-avatar'     => $user_data['avatar'] ?? '',
			'data-webhook-url'             => $webhook_url,
			'data-show-lead-form'          => $show_lead_form ? 'true' : 'false',
			'data-gradient-start'          => $gradient_start,
			'data-gradient-end'            => $gradient_end,
			'data-api-url'                 => rest_url( 'frs-mortgage-calculator/v1' ),
		];

		$attr_string = '';
		foreach ( $data_attrs as $key => $value ) {
			$attr_string .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $value ) );
		}

		// Get block wrapper attributes.
		$wrapper_attributes = get_block_wrapper_attributes( [
			'id'    => $unique_id,
			'class' => 'frs-mortgage-calculator-widget',
		] );

		return sprintf(
			'<div %s%s></div>',
			$wrapper_attributes,
			$attr_string
		);
	}

	/**
	 * Get calculator type from block name.
	 *
	 * @param string $block_name Full block name (e.g., 'frs/payment-calculator').
	 * @return string
	 */
	private function get_calculator_type_from_block_name( string $block_name ): string {
		// Remove namespace prefix.
		$name = str_replace( 'frs/', '', $block_name );

		// Look up in our block types array.
		if ( isset( $this->block_types[ $name ] ) ) {
			return $this->block_types[ $name ]['calculator_type'];
		}

		// Fallback to conventional.
		return 'conventional';
	}

	/**
	 * Get available block types.
	 *
	 * @return array
	 */
	public function get_block_types(): array {
		return $this->block_types;
	}
}
