"use client";

import React, { useState, useEffect } from "react";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <div className="rounded-lg bg-surface-light p-8 shadow-md dark:bg-surface-dark">
          <p className="mb-6 text-text-light-light dark:text-text-light-dark">
            Last updated: September 6, 2024
          </p>
          <p className="mb-6 text-text-light dark:text-text-dark">
            Sidekick (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is
            committed to protecting your privacy. This Privacy Policy explains
            how we collect, use, disclose, and safeguard your information when
            you use our application.
          </p>

          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Use of Google Workspace APIs
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We want to explicitly affirm that any data obtained through Google Workspace APIs is not used to develop, improve, or train generalized AI and/or ML models. We respect your privacy and the intended use of these APIs as outlined in Google&apos;s developer policies.
          </p>

          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Data Sharing and Disclosure
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We do not share, transfer, or disclose Google user data to any third parties, except in the following limited circumstances:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights, privacy, safety, or property</li>
            <li>In connection with the sale or transfer of all or part of our business</li>
          </ul>

          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Google API Scopes
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            Our application requests the following Google API scopes:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>https://www.googleapis.com/auth/userinfo.email</li>
            <li>https://www.googleapis.com/auth/userinfo.profile</li>
            <li>https://www.googleapis.com/auth/calendar.events</li>
            <li>https://www.googleapis.com/auth/calendar.events.owned</li>
            <li>https://www.googleapis.com/auth/gmail.send</li>
            <li>https://www.googleapis.com/auth/gmail.modify</li>
            <li>https://www.googleapis.com/auth/gmail.compose</li>
            <li>https://www.googleapis.com/auth/gmail.readonly</li>
          </ul>
          <p className="mb-6 text-text-light dark:text-text-dark">
            These scopes allow us to access your email, profile information, and calendar data to provide our services. We only access the minimum amount of data necessary for the functioning of our application. Here&apos;s a brief explanation of what each scope allows:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>Email and profile information: To identify you and communicate with you</li>
            <li>Calendar events: To manage and schedule events on your behalf</li>
            <li>Gmail access: To send, modify, compose, and read emails as part of our service functionality</li>
          </ul>

          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Information We Collect
          </h2>
          <p className="mb-4 text-text-light dark:text-text-dark">
            We collect information that you provide directly to us when you use
            our application, such as:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>Your name and email address when you create an account</li>
            <li>Task details and content you create within the application</li>
            <li>Usage data and interactions with the application</li>
          </ul>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            How We Use Your Information
          </h2>
          <p className="mb-4 text-text-light dark:text-text-dark">
            We use the information we collect to:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>Provide, maintain, and improve our services</li>
            <li>Personalize your experience within the application</li>
            <li>Communicate with you about updates, features, and support</li>
            <li>
              Analyze usage patterns to enhance our application&apos;s
              functionality
            </li>
          </ul>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Data Security
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized or unlawful
            processing, accidental loss, destruction, or damage.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Your Rights
          </h2>
          <p className="mb-4 text-text-light dark:text-text-dark">
            You have the right to:
          </p>
          <ul className="mb-6 list-inside list-disc text-text-light dark:text-text-dark">
            <li>Access and receive a copy of your personal data</li>
            <li>Rectify inaccurate personal data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to the processing of your personal data</li>
            <li>Restrict the processing of your personal data</li>
          </ul>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Changes to This Privacy Policy
          </h2>
          <p className="mb-6 text-text-light dark:text-text-dark">
            We may update our Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy on this page
            and updating the &quot;Last updated&quot; date at the top of this
            Privacy Policy.
          </p>
          <h2 className="mb-4 mt-8 text-2xl font-semibold text-text-light dark:text-text-dark">
            Contact Us
          </h2>
          <p className="mb-4 text-text-light dark:text-text-dark">
            If you have any questions about this Privacy Policy, please contact
            us at:
          </p>
          <p className="text-text-light dark:text-text-dark">
            Email: help@sidekick.com
          </p>
        </div>
      </div>
    </div>
  );
}
