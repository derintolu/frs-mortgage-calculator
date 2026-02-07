/**
 * FRS Mortgage Calculator — Editor block registrations.
 *
 * Company lead-gen calculator blocks for the Gutenberg inserter.
 * These are the public/company versions — no loan officer association.
 * LO-attached versions are handled separately on profile pages.
 */

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Block definitions — 7 individual calculators + 1 all-in-one tabbed.
 */
const BLOCKS = [
	{
		name: 'frs/all-calculators',
		title: __( 'All Calculators (Tabbed)', 'frs-mortgage-calculator' ),
		description: __( 'Full tabbed mortgage calculator suite — all 7 calculators with tab navigation.', 'frs-mortgage-calculator' ),
		keywords: [ 'mortgage', 'calculator', 'all', 'tabs', 'suite' ],
	},
	{
		name: 'frs/payment-calculator',
		title: __( 'Payment Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Monthly payment breakdown — principal, interest, taxes, and insurance.', 'frs-mortgage-calculator' ),
		keywords: [ 'mortgage', 'payment', 'calculator', 'loan', 'monthly' ],
	},
	{
		name: 'frs/affordability-calculator',
		title: __( 'Affordability Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Calculate maximum home price based on income and expenses.', 'frs-mortgage-calculator' ),
		keywords: [ 'affordability', 'income', 'calculator', 'budget' ],
	},
	{
		name: 'frs/buydown-calculator',
		title: __( 'Buydown Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Rate buydown schedule calculator for temporary or permanent buydowns.', 'frs-mortgage-calculator' ),
		keywords: [ 'buydown', 'rate', 'calculator', 'points' ],
	},
	{
		name: 'frs/dscr-calculator',
		title: __( 'DSCR Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Debt service coverage ratio calculator for investment properties.', 'frs-mortgage-calculator' ),
		keywords: [ 'dscr', 'investment', 'calculator', 'rental' ],
	},
	{
		name: 'frs/refinance-calculator',
		title: __( 'Refinance Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Refinance savings analysis comparing current and new loan terms.', 'frs-mortgage-calculator' ),
		keywords: [ 'refinance', 'savings', 'calculator', 'refi' ],
	},
	{
		name: 'frs/net-proceeds-calculator',
		title: __( 'Net Proceeds Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Estimate net proceeds from a home sale after fees and payoffs.', 'frs-mortgage-calculator' ),
		keywords: [ 'net proceeds', 'sale', 'calculator', 'selling' ],
	},
	{
		name: 'frs/rent-vs-buy-calculator',
		title: __( 'Rent vs Buy Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Compare the long-term costs of renting versus buying a home.', 'frs-mortgage-calculator' ),
		keywords: [ 'rent', 'buy', 'calculator', 'comparison' ],
	},
];

/** Look up block metadata by name. */
function getBlockMeta( name ) {
	return BLOCKS.find( ( b ) => b.name === name ) || {};
}

/**
 * Shared edit component for all calculator blocks.
 */
function CalculatorEdit( { name, attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { showLeadForm, gradientStart, gradientEnd, webhookUrl } = attributes;
	const meta = getBlockMeta( name );
	const isAllCalc = name === 'frs/all-calculators';

	const previewStyle = {
		background: `linear-gradient(135deg, ${ gradientStart } 0%, ${ gradientEnd } 100%)`,
		padding: '32px 24px',
		borderRadius: '12px',
		color: '#fff',
		minHeight: isAllCalc ? '240px' : '200px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '12px',
		textAlign: 'center',
	};

	const titleStyle = {
		fontSize: isAllCalc ? '24px' : '20px',
		fontWeight: '700',
		margin: 0,
		lineHeight: 1.3,
	};

	const descStyle = {
		fontSize: '14px',
		opacity: 0.85,
		margin: 0,
		maxWidth: '400px',
	};

	const badgeStyle = {
		fontSize: '11px',
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: '0.05em',
		background: 'rgba(255,255,255,0.2)',
		padding: '4px 12px',
		borderRadius: '100px',
	};

	const settingsStyle = {
		display: 'flex',
		gap: '16px',
		flexWrap: 'wrap',
		justifyContent: 'center',
		marginTop: '8px',
		fontSize: '12px',
		opacity: 0.75,
	};

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Lead Capture', 'frs-mortgage-calculator' ) }>
					<ToggleControl
						label={ __( 'Show Lead Capture Form', 'frs-mortgage-calculator' ) }
						help={ __( 'Leads are sent to the ISA team.', 'frs-mortgage-calculator' ) }
						checked={ showLeadForm }
						onChange={ ( val ) => setAttributes( { showLeadForm: val } ) }
					/>
					<TextControl
						label={ __( 'Webhook URL', 'frs-mortgage-calculator' ) }
						help={ __( 'Optional. URL to receive lead submissions via POST.', 'frs-mortgage-calculator' ) }
						value={ webhookUrl }
						onChange={ ( val ) => setAttributes( { webhookUrl: val } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Brand Colors', 'frs-mortgage-calculator' ) } initialOpen={ false }>
					<p className="components-base-control__label">
						{ __( 'Gradient Start', 'frs-mortgage-calculator' ) }
					</p>
					<ColorPalette
						value={ gradientStart }
						onChange={ ( val ) => setAttributes( { gradientStart: val || '#2563eb' } ) }
						clearable={ false }
					/>
					<p className="components-base-control__label" style={ { marginTop: '16px' } }>
						{ __( 'Gradient End', 'frs-mortgage-calculator' ) }
					</p>
					<ColorPalette
						value={ gradientEnd }
						onChange={ ( val ) => setAttributes( { gradientEnd: val || '#2dd4da' } ) }
						clearable={ false }
					/>
				</PanelBody>
			</InspectorControls>

			<div style={ previewStyle }>
				<span style={ badgeStyle }>
					{ isAllCalc ? 'FRS Calculator Suite' : 'FRS Calculator' }
				</span>
				<p style={ titleStyle }>{ meta.title }</p>
				<p style={ descStyle }>{ meta.description }</p>
				<div style={ settingsStyle }>
					<span>{ showLeadForm ? '✓ Lead capture on' : '✗ Lead capture off' }</span>
					{ isAllCalc && <span>7 calculators with tabs</span> }
				</div>
			</div>
		</div>
	);
}

/**
 * Register all blocks.
 */
BLOCKS.forEach( ( block ) => {
	registerBlockType( block.name, {
		edit: CalculatorEdit,
		save: () => null,
	} );
} );
