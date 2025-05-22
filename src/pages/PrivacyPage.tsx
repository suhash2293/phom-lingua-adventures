import React from 'react';
const PrivacyPage = () => {
  return <div className="container px-4 md:px-6 py-8 md:py-12">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
        <p className="text-muted-foreground mb-6">Last updated: May 22, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
          <p>
            PhomShah ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our language learning platform.
          </p>
          <p>
            By accessing or using PhomShah, you agree to this Privacy Policy. If you do not agree with our policies, please do not access or use our services.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mb-2">2.1 Personal Information</h3>
          <p>We may collect personal information such as:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Name</li>
            <li>Email address</li>
            <li>Username and password</li>
            <li>Profile information</li>
            <li>Learning preferences and progress</li>
          </ul>
          
          <h3 className="text-xl font-semibold mb-2">2.2 Usage Information</h3>
          <p>We automatically collect certain information about your device and how you interact with our platform, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Device type, operating system, and browser</li>
            <li>IP address</li>
            <li>Pages visited and features used</li>
            <li>Time spent on the platform</li>
            <li>Learning progress and patterns</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Provide, maintain, and improve our language learning services</li>
            <li>Create and manage your account</li>
            <li>Track and personalize your learning experience</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Send you technical notices, updates, and administrative messages</li>
            <li>Analyze usage patterns and trends to enhance our platform</li>
            <li>Protect against, identify, and prevent fraud and other harmful activities</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">4. Google Play Services</h2>
          <p>
            Our app uses Google Play Services and may collect information through Google Play Services, including:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Installation information: We collect information related to the installation of our app, Google Play Services, and related analytics.</li>
            <li>Device information: We collect device-specific information such as hardware model, operating system version, and mobile network information.</li>
            <li>Play Games Services: If you use Google Play Games features, we may collect information according to your Google Play Games privacy settings.</li>
          </ul>
          <p>
            Google Play Services' use of information is governed by Google's privacy policy, which you can review at <a href="https://policies.google.com/privacy" className="text-primary hover:underline">https://policies.google.com/privacy</a>.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">5. In-App Purchases and Donations</h2>
          <p>
            Our app offers in-app purchases and donations through Google Play's billing system. When you make a purchase or donation:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Payment information: Google Play processes all payments. We do not collect or store your payment method details.</li>
            <li>Transaction information: We receive and store confirmation of purchases and donations, including transaction IDs and purchase tokens necessary for order fulfillment.</li>
            <li>Billing history: Your purchase history is stored in association with your account to track donations and provide appropriate services.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Regular security assessments and penetration testing</li>
            <li>Access controls and authentication procedures for our systems</li>
            <li>Employee training on privacy and security practices</li>
          </ul>
          <p>
            However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">7. Data Retention and Deletion</h2>
          <p>
            We retain your personal information for as long as necessary to fulfill the purposes described in this Privacy Policy, unless a longer retention period is required by law.
          </p>
          <p>
            You may request deletion of your account and associated personal data at any time by contacting us at the email address provided below. Upon receiving your request, we will:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Delete your account information within 30 days</li>
            <li>Remove your personal data from our active systems</li>
            <li>Retain certain information as required by applicable laws or for legitimate business purposes, such as analytics in an anonymized form</li>
          </ul>
          <p>
            Please note that some information may remain in our backup systems for a period of time before being completely removed.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">8. Cookies and Tracking</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with small amounts of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p>
            Our app and website use the following types of cookies:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Essential cookies: Required for basic functionality of our services</li>
            <li>Functional cookies: Remember your preferences and settings</li>
            <li>Analytics cookies: Help us understand how you use our app</li>
            <li>Marketing cookies: Used to deliver relevant advertisements (if applicable)</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">9. Third-Party Services</h2>
          <p>
            Our platform may include links to third-party websites, plugins, and applications. We also use third-party services to support our app functionality:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Firebase Analytics: For app usage analytics and performance monitoring</li>
            <li>Supabase: For database services and user authentication</li>
            <li>Google Play services: For in-app purchases, authentication, and other services</li>
          </ul>
          <p>
            Clicking on third-party links may allow them to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements. We encourage you to read the privacy policies of every website you visit or service you use.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">10. User Rights</h2>
          <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
          <ul className="list-disc pl-6 mb-4">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate or incomplete information</li>
            <li>Deletion of your personal information</li>
            <li>Restriction or objection to processing</li>
            <li>Data portability</li>
            <li>Withdrawal of consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Information" section below. We will respond to your request within 30 days.
          </p>
          <p>
            For users in the European Economic Area (EEA), United Kingdom, or regions covered by similar data protection regulations, we serve as the data controller for your personal information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">11. Children's Privacy</h2>
          <p>
            Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13 without verification of parental consent, we will take steps to delete that information as quickly as possible.
          </p>
          <p>
            If you are a parent or guardian and believe your child has provided us with personal information without your consent, please contact us immediately so that we can take appropriate action.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">12. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have different data protection laws than your country of residence.
          </p>
          <p>
            When we transfer your information to other countries, we will protect that information as described in this Privacy Policy and in accordance with applicable laws. We use standard contractual clauses and other safeguards to ensure your data remains protected wherever it is transferred.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">13. Changes to Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. For significant changes, we will provide a more prominent notice, which may include an in-app notification.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">14. Contact Information</h2>
          <p>
            If you have any questions or concerns about our Privacy Policy or data practices, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> moilenlenla@gmail.com
          </p>
          
        </section>
      </div>
    </div>;
};
export default PrivacyPage;