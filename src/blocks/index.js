/**
 * FRS Mortgage Calculator — Editor block registrations.
 *
 * Registers all 7 calculator blocks in the Gutenberg inserter with
 * shared InspectorControls for style/config and a ServerSideRender preview.
 */

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import {
	PanelBody,
	TextControl,
	ToggleControl,
	ColorPalette,
	__experimentalNumberControl as NumberControl,
} from '@wordpress/components';
import ServerSideRender from '@wordpress/server-side-render';
import { __ } from '@wordpress/i18n';

/**
 * All calculator blocks share the same attributes and editor UI.
 * Only the block name, title, description, and keywords differ.
 */
const BLOCKS = [
	{
		name: 'frs/payment-calculator',
		title: __( 'Payment Calculator', 'frs-mortgage-calculator' ),
		description: __( 'Monthly payment breakdown calculator showing principal, interest, taxes, and insurance.', 'frs-mortgage-calculator' ),
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

/**
 * Shared edit component for all calculator blocks.
 */
function CalculatorEdit( { name, attributes, setAttributes } ) {
	const blockProps = useBlockProps();
	const { userId, showLeadForm, gradientStart, gradientEnd, webhookUrl } = attributes;

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Calculator Settings', 'frs-mortgage-calculator' ) }>
					<NumberControl
						label={ __( 'Loan Officer User ID', 'frs-mortgage-calculator' ) }
						help={ __( 'WordPress user ID. Leave 0 for current user or default.', 'frs-mortgage-calculator' ) }
						value={ userId }
						min={ 0 }
						onChange={ ( val ) => setAttributes( { userId: parseInt( val, 10 ) || 0 } ) }
					/>
					<ToggleControl
						label={ __( 'Show Lead Capture Form', 'frs-mortgage-calculator' ) }
						checked={ showLeadForm }
						onChange={ ( val ) => setAttributes( { showLeadForm: val } ) }
					/>
					<TextControl
						label={ __( 'Webhook URL', 'frs-mortgage-calculator' ) }
						help={ __( 'URL to receive lead submissions via POST.', 'frs-mortgage-calculator' ) }
						value={ webhookUrl }
						onChange={ ( val ) => setAttributes( { webhookUrl: val } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Style', 'frs-mortgage-calculator' ) } initialOpen={ false }>
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

			<ServerSideRender
				block={ name }
				attributes={ attributes }
			/>
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
