import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MortgageCalculatorWidget } from './MortgageCalculatorWidget';
import '../index.css';

// Type for widget config
interface WidgetConfig {
  loanOfficerId?: number;
  webhookUrl?: string;
  showLeadForm?: boolean;
  brandColor?: string;
  loanOfficerName?: string;
  loanOfficerEmail?: string;
  loanOfficerPhone?: string;
  loanOfficerNmls?: string;
  loanOfficerAvatar?: string;
  gradientStart?: string;
  gradientEnd?: string;
  apiUrl?: string;
  nonce?: string;
}

// Store mounted roots for cleanup
const mountedRoots: Map<Element, Root> = new Map();

/**
 * Mount the calculator widget to a container
 * Can be called manually for dynamic embedding
 */
function mountWidget(container: HTMLElement, config?: WidgetConfig): Root | null {
  // Get config from data attributes if not provided
  const finalConfig: WidgetConfig = config || {
    loanOfficerId: container.dataset.loanOfficerId ? parseInt(container.dataset.loanOfficerId) : undefined,
    webhookUrl: container.dataset.webhookUrl,
    showLeadForm: container.dataset.showLeadForm !== 'false',
    brandColor: container.dataset.brandColor,
    loanOfficerName: container.dataset.loanOfficerName,
    loanOfficerEmail: container.dataset.loanOfficerEmail,
    loanOfficerPhone: container.dataset.loanOfficerPhone,
    loanOfficerNmls: container.dataset.loanOfficerNmls,
    loanOfficerAvatar: container.dataset.loanOfficerAvatar,
    gradientStart: container.dataset.gradientStart,
    gradientEnd: container.dataset.gradientEnd,
    apiUrl: container.dataset.apiUrl,
    nonce: container.dataset.nonce,
  };

  try {
    // Unmount existing if present
    if (mountedRoots.has(container)) {
      mountedRoots.get(container)?.unmount();
      mountedRoots.delete(container);
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <MortgageCalculatorWidget config={finalConfig} />
      </React.StrictMode>
    );
    mountedRoots.set(container, root);
    return root;
  } catch (error) {
    console.error('FRS Mortgage Calculator: Error mounting widget:', error);
    return null;
  }
}

/**
 * Unmount widget from container
 */
function unmountWidget(container: HTMLElement): void {
  if (mountedRoots.has(container)) {
    mountedRoots.get(container)?.unmount();
    mountedRoots.delete(container);
  }
}

/**
 * Auto-initialize all widgets with id="frs-mc-root" or data-frs-mortgage-calculator
 */
function autoInit(): void {
  // Find by ID
  const byId = document.getElementById('frs-mc-root');
  if (byId && !mountedRoots.has(byId)) {
    mountWidget(byId);
  }

  // Find by data attribute (for multiple widgets on one page)
  document.querySelectorAll('[data-frs-mortgage-calculator]').forEach((el) => {
    if (el instanceof HTMLElement && !mountedRoots.has(el)) {
      mountWidget(el);
    }
  });
}

// Expose global API for external embedding
declare global {
  interface Window {
    FRSMortgageCalculator: {
      mount: typeof mountWidget;
      unmount: typeof unmountWidget;
      init: typeof autoInit;
    };
  }
}

window.FRSMortgageCalculator = {
  mount: mountWidget,
  unmount: unmountWidget,
  init: autoInit,
};

// Auto-initialize
if (typeof document !== 'undefined') {
  // If DOM already loaded, init immediately
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(autoInit, 0);
  } else {
    // Otherwise wait for DOMContentLoaded
    window.addEventListener('DOMContentLoaded', autoInit);
  }
}
