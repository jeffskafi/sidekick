"use client";

import React, { useState, useEffect } from "react";

export default function TermsOfService() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or return a loading spinner
  }

  return (
    <div className="min-h-screen bg-background-light px-4 py-12 dark:bg-background-dark sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <h1 className="mb-8 text-center text-4xl font-extrabold text-text-light dark:text-text-dark">
          Terms of Service
        </h1>
        <div className="rounded-lg bg-surface-light p-8 shadow-md dark:bg-surface-dark">
          <p className="mb-6 text-text-light-light dark:text-text-light-dark">
            Last updated: August 6, 2024
          </p>
          <p className="mb-6 text-text-light dark:text-text-dark">
            Please read these Terms of Service (&quot;Terms&quot;, &quot;Terms
            of Service&quot;) carefully before using the Sidekick application
            (&quot;the Service&quot;) operated by Sidekick (&quot;us&quot;,
            &quot;we&quot;, or &quot;our&quot;).
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            1. Acceptance of Terms
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            By accessing or using the Service, you agree to be bound by these
            Terms. If you disagree with any part of the terms, then you may not
            access the Service.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            2. Description of Service
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            Sidekick provides a productivity and task management application.
            The specific features and functionality may change over time.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            3. User Accounts
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            When you create an account with us, you must provide accurate,
            complete, and up-to-date information. Failure to do so constitutes a
            breach of the Terms, which may result in immediate termination of
            your account on our Service.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            4. Intellectual Property
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            The Service and its original content, features, and functionality
            are and will remain the exclusive property of Sidekick and its
            licensors.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            5. User Content
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            You retain all rights to any content you submit, post or display on
            or through the Service. By submitting, posting or displaying
            content, you grant us a worldwide, non-exclusive, royalty-free
            license to use, reproduce, adapt, publish, translate and distribute
            it.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            6. Prohibited Uses
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            You may not use the Service for any illegal purpose or to violate
            any laws in your jurisdiction. You may not use the Service to
            distribute unsolicited commercial email or transmit malware.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            7. Termination
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We may terminate or suspend your account immediately, without prior
            notice or liability, for any reason whatsoever, including without
            limitation if you breach the Terms.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            8. Limitation of Liability
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            In no event shall Sidekick, nor its directors, employees, partners,
            agents, suppliers, or affiliates, be liable for any indirect,
            incidental, special, consequential or punitive damages, including
            without limitation, loss of profits, data, use, goodwill, or other
            intangible losses, resulting from your access to or use of or
            inability to access or use the Service.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            9. Governing Law
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            These Terms shall be governed and construed in accordance with the
            laws of [Your Country/State], without regard to its conflict of law
            provisions.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            10. Changes
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We reserve the right, at our sole discretion, to modify or replace
            these Terms at any time. We will provide notice of any significant
            changes to these Terms.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Contact Us
          </h2>
          <p className="mb-4 text-text-light dark:text-text-dark">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="text-text-light dark:text-text-dark">
            Email: help@sidekick.com
          </p>
        </div>
      </div>
    </div>
  );
}
