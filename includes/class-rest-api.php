<?php
/**
 * REST API handler class.
 *
 * @package FRSMortgageCalculator
 */

namespace FRSMortgageCalculator;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * RestApi class - handles REST API endpoints.
 */
class RestApi {

	/**
	 * API namespace.
	 *
	 * @var string
	 */
	const NAMESPACE = 'frs-mortgage-calculator/v1';

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'register_routes' ] );
		add_action( 'rest_api_init', [ $this, 'add_cors_headers' ] );
	}

	/**
	 * Add CORS headers for widget embedding on external sites.
	 */
	public function add_cors_headers(): void {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter(
			'rest_pre_serve_request',
			function ( $value ) {
				header( 'Access-Control-Allow-Origin: *' );
				header( 'Access-Control-Allow-Methods: GET, POST, OPTIONS' );
				header( 'Access-Control-Allow-Headers: Content-Type, X-WP-Nonce' );
				return $value;
			}
		);
	}

	/**
	 * Register REST API routes.
	 */
	public function register_routes(): void {
		// Lead submission endpoint.
		register_rest_route(
			self::NAMESPACE,
			'/leads',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'submit_lead' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'name'            => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'email'           => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_email',
					],
					'phone'           => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'action'          => [
						'type'              => 'string',
						'default'           => 'lead',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'loan_officer_id' => [
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					],
				],
			]
		);

		// Get loan officer data.
		register_rest_route(
			self::NAMESPACE,
			'/loan-officer/(?P<id>\d+)',
			[
				'methods'             => 'GET',
				'callback'            => [ $this, 'get_loan_officer' ],
				'permission_callback' => '__return_true',
				'args'                => [
					'id' => [
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					],
				],
			]
		);
	}

	/**
	 * Submit lead via REST API.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function submit_lead( \WP_REST_Request $request ) {
		$params = $request->get_json_params();

		$action          = sanitize_text_field( $params['action'] ?? 'lead' );
		$name            = sanitize_text_field( $params['name'] ?? '' );
		$email           = sanitize_email( $params['email'] ?? '' );
		$phone           = sanitize_text_field( $params['phone'] ?? '' );
		$recipient_email = sanitize_email( $params['recipient_email'] ?? '' );
		$wants_contact   = (bool) ( $params['wants_contact'] ?? false );
		$loan_officer_id = absint( $params['loan_officer_id'] ?? 0 );
		$calculator_type = sanitize_text_field( $params['calculator_type'] ?? 'mortgage' );
		$results         = $params['results'] ?? [];
		$webhook_url     = esc_url_raw( $params['webhook_url'] ?? '' );

		if ( empty( $name ) || empty( $email ) ) {
			return new \WP_Error( 'missing_fields', 'Name and email are required', [ 'status' => 400 ] );
		}

		if ( 'share' === $action && empty( $recipient_email ) ) {
			return new \WP_Error( 'missing_recipient', 'Recipient email is required for sharing', [ 'status' => 400 ] );
		}

		// Get loan officer data.
		$lo_data  = $loan_officer_id ? Plugin::get_user_data( $loan_officer_id ) : [];
		$lo_name  = $lo_data['name'] ?? 'Your Loan Officer';
		$lo_email = $lo_data['email'] ?? '';
		$lo_phone = $lo_data['phone'] ?? '';
		$lo_nmls  = $lo_data['nmls'] ?? '';

		// Build email HTML.
		$email_html = $this->build_results_email( $name, $calculator_type, $results, $lo_name, $lo_email, $lo_phone, $lo_nmls );

		// Send email via WordPress mail.
		if ( 'email-me' === $action ) {
			$subject  = 'Your Mortgage Calculator Results';
			$to_email = $email;
		} elseif ( 'share' === $action ) {
			$subject  = $name . ' shared mortgage calculator results with you';
			$to_email = $recipient_email;
		}

		if ( ! empty( $to_email ) ) {
			$this->send_html_email( $to_email, $subject, $email_html, $lo_email );
		}

		// Store lead if they want contact or it's a direct lead submission.
		if ( $wants_contact || 'lead' === $action ) {
			global $wpdb;
			$table = $wpdb->prefix . 'lead_submissions';

			$name_parts = explode( ' ', $name, 2 );
			$lead_data  = [
				'first_name'      => $name_parts[0],
				'last_name'       => $name_parts[1] ?? '',
				'email'           => $email,
				'phone'           => $phone,
				'loan_officer_id' => $loan_officer_id,
				'lead_source'     => 'Mortgage Calculator - ' . ucfirst( $calculator_type ),
				'notes'           => wp_json_encode( $results ),
				'status'          => 'new',
				'created_at'      => current_time( 'mysql' ),
				'updated_at'      => current_time( 'mysql' ),
			];

			$inserted = $wpdb->insert( $table, $lead_data );
			$lead_id  = $inserted ? $wpdb->insert_id : 0;

			// Send to webhook if provided.
			if ( $webhook_url ) {
				wp_remote_post(
					$webhook_url,
					[
						'body'    => wp_json_encode( array_merge( $lead_data, [ 'lead_id' => $lead_id ] ) ),
						'headers' => [ 'Content-Type' => 'application/json' ],
						'timeout' => 10,
					]
				);
			}

			// Email notification to loan officer.
			if ( $loan_officer_id && $lo_email ) {
				$lo_subject  = 'New Mortgage Calculator Lead: ' . $name;
				$lo_message  = "New lead from your mortgage calculator:\n\n";
				$lo_message .= "Name: {$name}\nEmail: {$email}\nPhone: {$phone}\n";
				$lo_message .= "Calculator: {$calculator_type}\n";
				$lo_message .= 'Wants Contact: ' . ( $wants_contact ? 'Yes' : 'No' ) . "\n";
				wp_mail( $lo_email, $lo_subject, $lo_message );
			}
		}

		return rest_ensure_response(
			[
				'success' => true,
				'message' => 'email-me' === $action ? 'Results sent to your email' : ( 'share' === $action ? 'Results shared successfully' : 'Lead submitted successfully' ),
			]
		);
	}

	/**
	 * Get loan officer data.
	 *
	 * @param \WP_REST_Request $request REST request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_loan_officer( \WP_REST_Request $request ) {
		$user_id = $request->get_param( 'id' );
		$data    = Plugin::get_user_data( $user_id );

		if ( empty( $data ) ) {
			return new \WP_Error( 'not_found', 'Loan officer not found', [ 'status' => 404 ] );
		}

		return rest_ensure_response( $data );
	}

	/**
	 * Build HTML email with calculator results.
	 *
	 * @param string $name            User name.
	 * @param string $calculator_type Calculator type.
	 * @param array  $results         Calculator results.
	 * @param string $lo_name         Loan officer name.
	 * @param string $lo_email        Loan officer email.
	 * @param string $lo_phone        Loan officer phone.
	 * @param string $lo_nmls         Loan officer NMLS.
	 * @return string
	 */
	private function build_results_email( string $name, string $calculator_type, array $results, string $lo_name, string $lo_email, string $lo_phone, string $lo_nmls ): string {
		$summary       = $results['summary'] ?? [];
		$primary_label = $summary['primaryLabel'] ?? 'Result';
		$primary_value = $summary['primaryValue'] ?? 'N/A';
		$items         = $summary['items'] ?? [];
		$title         = $summary['title'] ?? ucfirst( str_replace( '-', ' ', $calculator_type ) ) . ' Calculator Results';

		$items_html = '';
		foreach ( $items as $item ) {
			$items_html .= sprintf(
				'<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">%s</td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #111827;">%s</td></tr>',
				esc_html( $item['label'] ),
				esc_html( $item['value'] )
			);
		}

		$gradient_start = Settings::get_option( 'gradient_start', '#2563eb' );
		$gradient_end   = Settings::get_option( 'gradient_end', '#2dd4da' );

		$html = <<<HTML
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
	<table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
		<!-- Header -->
		<tr>
			<td style="background: linear-gradient(135deg, {$gradient_start} 0%, {$gradient_end} 100%); padding: 32px; text-align: center;">
				<h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">{$title}</h1>
			</td>
		</tr>

		<!-- Greeting -->
		<tr>
			<td style="padding: 32px 32px 16px;">
				<p style="margin: 0; font-size: 16px; color: #374151;">Hi {$name},</p>
				<p style="margin: 16px 0 0; font-size: 16px; color: #374151;">Here are your calculator results:</p>
			</td>
		</tr>

		<!-- Primary Result -->
		<tr>
			<td style="padding: 0 32px;">
				<div style="background: linear-gradient(135deg, {$gradient_start} 0%, {$gradient_end} 100%); border-radius: 12px; padding: 24px; text-align: center;">
					<p style="margin: 0 0 8px; font-size: 14px; color: rgba(255,255,255,0.9);">{$primary_label}</p>
					<p style="margin: 0; font-size: 36px; font-weight: 700; color: #ffffff;">{$primary_value}</p>
				</div>
			</td>
		</tr>

		<!-- Breakdown -->
		<tr>
			<td style="padding: 24px 32px;">
				<table width="100%" cellpadding="0" cellspacing="0">
					{$items_html}
				</table>
			</td>
		</tr>

		<!-- Loan Officer -->
		<tr>
			<td style="padding: 0 32px 32px;">
				<div style="background-color: #f9fafb; border-radius: 12px; padding: 24px;">
					<p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #374151;">Have questions? Contact your loan officer:</p>
					<p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">{$lo_name}</p>
					<p style="margin: 4px 0 0; font-size: 14px; color: #6b7280;">NMLS# {$lo_nmls}</p>
					<p style="margin: 12px 0 0;">
						<a href="mailto:{$lo_email}" style="color: #2563eb; text-decoration: none; font-size: 14px;">{$lo_email}</a>
					</p>
					<p style="margin: 4px 0 0;">
						<a href="tel:{$lo_phone}" style="color: #2563eb; text-decoration: none; font-size: 14px;">{$lo_phone}</a>
					</p>
				</div>
			</td>
		</tr>

		<!-- Footer -->
		<tr>
			<td style="padding: 24px 32px; background-color: #f9fafb; text-align: center;">
				<p style="margin: 0; font-size: 12px; color: #9ca3af;">
					This is an estimate only and does not constitute a loan commitment or guarantee.
					Actual rates and payments may vary based on your specific situation.
				</p>
			</td>
		</tr>
	</table>
</body>
</html>
HTML;

		return $html;
	}

	/**
	 * Send HTML email via WordPress mail.
	 *
	 * @param string $to       Recipient email.
	 * @param string $subject  Email subject.
	 * @param string $html     Email HTML content.
	 * @param string $reply_to Reply-to email address.
	 * @return bool
	 */
	private function send_html_email( string $to, string $subject, string $html, string $reply_to = '' ): bool {
		$headers = [ 'Content-Type: text/html; charset=UTF-8' ];

		if ( ! empty( $reply_to ) ) {
			$headers[] = 'Reply-To: ' . $reply_to;
		}

		$sent = wp_mail( $to, $subject, $html, $headers );

		if ( ! $sent ) {
			error_log( 'FRS Mortgage Calculator: Failed to send email to ' . $to );
		}

		return $sent;
	}
}
