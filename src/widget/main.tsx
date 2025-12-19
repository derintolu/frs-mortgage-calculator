import React from 'react';
import { createRoot } from 'react-dom/client';
import { MortgageCalculatorWidget } from './MortgageCalculatorWidget';
import '../index.css';

// Auto-initialize on load
if (typeof document !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    // Mount Mortgage Calculator Widget
    const container = document.getElementById('mortgage-calculator');
    if (container) {
      const config = {
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
        const root = createRoot(container);
        root.render(
          <React.StrictMode>
            <MortgageCalculatorWidget config={config} />
          </React.StrictMode>
        );
      } catch (error) {
        console.error('Error mounting Mortgage Calculator:', error);
      }
    }
  });
}
