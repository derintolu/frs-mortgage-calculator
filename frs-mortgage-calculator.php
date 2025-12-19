<?php
/**
 * Plugin Name: FRS Mortgage Calculator
 * Description: Embeddable mortgage calculator widget with lead capture - can be shared on external websites
 * Version: 1.0.0
 * Author: 21st Century Lending
 * Text Domain: frs-mortgage-calculator
 * Requires PHP: 8.0
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'FRS_MC_VERSION', '1.0.0' );
define( 'FRS_MC_DIR', plugin_dir_path( __FILE__ ) );
define( 'FRS_MC_URL', plugin_dir_url( __FILE__ ) );

/**
 * Initialize the plugin
 */
function init() {
    // Register shortcodes
    add_shortcode( 'frs_mortgage_calculator', __NAMESPACE__ . '\\render_shortcode' );
    add_shortcode( 'frs_mortgage_calculator_embed', __NAMESPACE__ . '\\render_embed_code' );

    // Enqueue assets
    add_action( 'wp_enqueue_scripts', __NAMESPACE__ . '\\enqueue_assets' );

    // Register REST API endpoints
    add_action( 'rest_api_init', __NAMESPACE__ . '\\register_rest_routes' );

    // Add CORS headers for external embedding
    add_action( 'rest_api_init', __NAMESPACE__ . '\\add_cors_headers' );
}
add_action( 'plugins_loaded', __NAMESPACE__ . '\\init' );

/**
 * Add CORS headers for widget embedding on external sites
 */
function add_cors_headers() {
    remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
    add_filter( 'rest_pre_serve_request', function( $value ) {
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type, X-WP-Nonce' );
        return $value;
    });
}

/**
 * Get widget asset URLs
 */
function get_widget_assets() {
    $dist_dir = FRS_MC_DIR . 'assets/dist/';
    $manifest_path = $dist_dir . '.vite/manifest.json';

    $js_url = '';
    $css_url = '';

    if ( file_exists( $manifest_path ) ) {
        $manifest = json_decode( file_get_contents( $manifest_path ), true );
        $entry = $manifest['src/widget/main.tsx'] ?? null;

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
 * Enqueue widget assets
 */
function enqueue_assets() {
    global $post;

    if ( ! is_a( $post, 'WP_Post' ) ) {
        return;
    }

    $has_shortcode = has_shortcode( $post->post_content, 'frs_mortgage_calculator' ) ||
                     has_shortcode( $post->post_content, 'frs_mortgage_calculator_embed' );

    if ( ! $has_shortcode ) {
        return;
    }

    $assets = get_widget_assets();

    if ( $assets['css'] ) {
        wp_enqueue_style( 'frs-mortgage-calculator', $assets['css'], [], FRS_MC_VERSION );
    }

    if ( $assets['js'] ) {
        wp_enqueue_script( 'frs-mortgage-calculator', $assets['js'], [], FRS_MC_VERSION, true );
    }
}

/**
 * Get user data for widget
 */
function get_user_data( $user_id ) {
    if ( ! $user_id ) {
        return [];
    }

    $user = get_user_by( 'id', $user_id );
    if ( ! $user ) {
        return [];
    }

    // Try to get profile data from frs-wp-users
    $profile_data = [];
    if ( class_exists( 'FRSUsers\Models\Profile' ) ) {
        $profile = \FRSUsers\Models\Profile::where( 'user_id', $user_id )->first();
        if ( $profile ) {
            $profile_data = $profile->toArray();
        }
    }

    $first_name = $profile_data['first_name'] ?? get_user_meta( $user_id, 'first_name', true );
    $last_name = $profile_data['last_name'] ?? get_user_meta( $user_id, 'last_name', true );

    // Get avatar
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
 * Render the calculator shortcode
 */
function render_shortcode( $atts ) {
    $atts = shortcode_atts(
        [
            'user_id'        => 0,
            'show_lead_form' => 'true',
            'webhook_url'    => '',
            'gradient_start' => '#2563eb',
            'gradient_end'   => '#2dd4da',
        ],
        $atts,
        'frs_mortgage_calculator'
    );

    // Determine user ID
    $user_id = intval( $atts['user_id'] );
    if ( ! $user_id && isset( $_GET['loan_officer_id'] ) ) {
        $user_id = intval( $_GET['loan_officer_id'] );
    }
    if ( ! $user_id ) {
        $user_id = get_current_user_id();
    }

    $user_data = get_user_data( $user_id );

    // Build data attributes
    $data_attrs = [
        'data-loan-officer-id'    => $user_id ?: '',
        'data-loan-officer-name'  => $user_data['name'] ?? '',
        'data-loan-officer-email' => $user_data['email'] ?? '',
        'data-loan-officer-phone' => $user_data['phone'] ?? '',
        'data-loan-officer-nmls'  => $user_data['nmls'] ?? '',
        'data-loan-officer-avatar'=> $user_data['avatar'] ?? '',
        'data-webhook-url'        => $atts['webhook_url'],
        'data-show-lead-form'     => $atts['show_lead_form'],
        'data-gradient-start'     => $atts['gradient_start'],
        'data-gradient-end'       => $atts['gradient_end'],
        'data-api-url'            => rest_url( 'frs-mortgage-calculator/v1' ),
    ];

    $attr_string = '';
    foreach ( $data_attrs as $key => $value ) {
        if ( $value !== '' ) {
            $attr_string .= sprintf( ' %s="%s"', esc_attr( $key ), esc_attr( $value ) );
        }
    }

    return '<div id="frs-mc-root" class="frs-mortgage-calculator-widget"' . $attr_string . '></div>';
}

/**
 * Render embed code for external sites
 */
function render_embed_code( $atts ) {
    $atts = shortcode_atts(
        [
            'user_id'        => get_current_user_id(),
            'gradient_start' => '#2563eb',
            'gradient_end'   => '#2dd4da',
        ],
        $atts,
        'frs_mortgage_calculator_embed'
    );

    $user_id = intval( $atts['user_id'] );
    $user_data = get_user_data( $user_id );
    $assets = get_widget_assets();

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
<script src="%s"></script>',
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
 * Register REST API routes
 */
function register_rest_routes() {
    // Lead submission endpoint
    register_rest_route( 'frs-mortgage-calculator/v1', '/leads', [
        'methods'             => 'POST',
        'callback'            => __NAMESPACE__ . '\\submit_lead',
        'permission_callback' => '__return_true',
    ]);

    // Get loan officer data
    register_rest_route( 'frs-mortgage-calculator/v1', '/loan-officer/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => __NAMESPACE__ . '\\get_loan_officer',
        'permission_callback' => '__return_true',
    ]);
}

/**
 * Submit lead via REST API
 */
function submit_lead( \WP_REST_Request $request ) {
    $params = $request->get_json_params();

    $name = sanitize_text_field( $params['name'] ?? '' );
    $email = sanitize_email( $params['email'] ?? '' );
    $phone = sanitize_text_field( $params['phone'] ?? '' );
    $loan_officer_id = absint( $params['loan_officer_id'] ?? 0 );
    $calculator_type = sanitize_text_field( $params['calculator_type'] ?? 'mortgage' );
    $calculation_data = $params['calculation_data'] ?? [];
    $webhook_url = esc_url_raw( $params['webhook_url'] ?? '' );

    if ( empty( $name ) || empty( $email ) ) {
        return new \WP_Error( 'missing_fields', 'Name and email are required', [ 'status' => 400 ] );
    }

    // Store lead in wp_lead_submissions table
    global $wpdb;
    $table = $wpdb->prefix . 'lead_submissions';

    $name_parts = explode( ' ', $name, 2 );
    $lead_data = [
        'first_name'       => $name_parts[0],
        'last_name'        => $name_parts[1] ?? '',
        'email'            => $email,
        'phone'            => $phone,
        'loan_officer_id'  => $loan_officer_id,
        'lead_source'      => 'Mortgage Calculator - ' . ucfirst( $calculator_type ),
        'notes'            => wp_json_encode( $calculation_data ),
        'status'           => 'new',
        'created_at'       => current_time( 'mysql' ),
        'updated_at'       => current_time( 'mysql' ),
    ];

    $inserted = $wpdb->insert( $table, $lead_data );
    $lead_id = $inserted ? $wpdb->insert_id : 0;

    // Send to webhook if provided
    if ( $webhook_url ) {
        wp_remote_post( $webhook_url, [
            'body'    => wp_json_encode( array_merge( $lead_data, [ 'lead_id' => $lead_id ] ) ),
            'headers' => [ 'Content-Type' => 'application/json' ],
            'timeout' => 10,
        ]);
    }

    // Email notification to loan officer
    if ( $loan_officer_id ) {
        $lo = get_userdata( $loan_officer_id );
        if ( $lo && $lo->user_email ) {
            $subject = 'New Mortgage Calculator Lead: ' . $name;
            $message = "New lead from your mortgage calculator:\n\n";
            $message .= "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\n";
            $message .= "Calculator: {$calculator_type}\n";
            wp_mail( $lo->user_email, $subject, $message );
        }
    }

    return [
        'success' => true,
        'lead_id' => $lead_id,
        'message' => 'Lead submitted successfully',
    ];
}

/**
 * Get loan officer data
 */
function get_loan_officer( \WP_REST_Request $request ) {
    $user_id = $request->get_param( 'id' );
    $data = get_user_data( $user_id );

    if ( empty( $data ) ) {
        return new \WP_Error( 'not_found', 'Loan officer not found', [ 'status' => 404 ] );
    }

    return $data;
}
