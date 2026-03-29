import React from 'react';
import {
  Shield,
  BookOpen,
  Database,
  Target,
  Share2,
  Cookie,
  Lock,
  Clock,
  UserCheck,
  Baby,
  ExternalLink,
  RefreshCw,
  Mail,
} from 'lucide-react';
import LegalDocLayout from '../components/LegalDocLayout';
import { LegalSection } from '../components/LegalSection';

const P = ({ children }) => <p className="text-text-dark/90 leading-relaxed">{children}</p>;
const H2 = ({ children }) => <h2 className="text-lg font-bold text-text-dark">{children}</h2>;
const UL = ({ children }) => <ul className="list-disc space-y-1 pl-6 text-text-dark/90">{children}</ul>;
const LI = ({ children }) => <li>{children}</li>;

/**
 * `privacyploicy.md` was empty in the repo; this policy matches ASH Enterprises services
 * and Indian practice. Replace with client-approved legal copy when available.
 */
const PrivacyPolicyPage = () => (
  <LegalDocLayout title="Privacy Policy" lastUpdated="March 28, 2026" icon={Shield}>
    <LegalSection icon={BookOpen}>
      <H2>1. Introduction</H2>
      <P>
        ASH Enterprises (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the website and rental &amp; services
        platform for AC rentals, related appliances, bookings, and support. This Privacy Policy explains how we collect,
        use, disclose, and safeguard your information when you use our services. By using our site or services, you agree
        to this policy.
      </P>
    </LegalSection>

    <LegalSection icon={Database}>
      <H2>2. Information We Collect</H2>
      <P>We may collect:</P>
      <UL>
        <LI>
          <strong>Account &amp; profile:</strong> name, email, phone number, address, pincode, and related details you
          provide at signup or in your profile
        </LI>
        <LI>
          <strong>Orders &amp; bookings:</strong> rental selections, duration, delivery details, payment method type
          (processing is handled by our payment partners; we do not store full card numbers)
        </LI>
        <LI>
          <strong>Communications:</strong> messages you send via contact forms, support tickets, email, or phone
        </LI>
        <LI>
          <strong>Technical data:</strong> IP address, browser type, device information, and cookies (see below) to
          operate and improve the platform
        </LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Target}>
      <H2>3. How We Use Your Information</H2>
      <P>We use information to:</P>
      <UL>
        <LI>Create and manage accounts, process orders, rentals, and service requests</LI>
        <LI>Communicate about bookings, delivery, payments, and support</LI>
        <LI>Improve our website, services, and security</LI>
        <LI>Comply with legal obligations and resolve disputes</LI>
        <LI>Send important notices about our terms or this policy (we minimise marketing unless you opt in)</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Share2}>
      <H2>4. Sharing of Information</H2>
      <P>
        We may share information with payment gateways (e.g. Razorpay), logistics/installation partners, and service
        providers who assist our operations, only as needed to fulfil your order. We may disclose information if required
        by law, court order, or to protect our rights and users&apos; safety. We do not sell your personal information.
      </P>
    </LegalSection>

    <LegalSection icon={Cookie}>
      <H2>5. Cookies &amp; Similar Technologies</H2>
      <P>
        We may use cookies and similar technologies to keep you logged in, remember preferences, and understand how the
        site is used. You can control cookies through your browser settings; disabling them may affect some features.
      </P>
    </LegalSection>

    <LegalSection icon={Lock}>
      <H2>6. Data Security</H2>
      <P>
        We implement reasonable technical and organisational measures to protect your information. However, no method of
        transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
      </P>
    </LegalSection>

    <LegalSection icon={Clock}>
      <H2>7. Retention</H2>
      <P>
        We retain personal data only as long as needed for the purposes above, including legal, accounting, and
        dispute-resolution requirements, unless a longer period is required by law.
      </P>
    </LegalSection>

    <LegalSection icon={UserCheck}>
      <H2>8. Your Rights</H2>
      <P>
        Depending on applicable law, you may have the right to access, correct, or delete certain personal data, or to
        object to or restrict some processing. To exercise these rights, contact us using the details below. We may need
        to verify your identity before responding.
      </P>
    </LegalSection>

    <LegalSection icon={Baby}>
      <H2>9. Children&apos;s Privacy</H2>
      <P>
        Our services are not directed at children under 18. We do not knowingly collect personal information from
        children. If you believe we have done so, please contact us so we can delete it.
      </P>
    </LegalSection>

    <LegalSection icon={ExternalLink}>
      <H2>10. Third-Party Links</H2>
      <P>
        Our website may link to other sites. We are not responsible for their privacy practices. Please read their
        policies before providing information.
      </P>
    </LegalSection>

    <LegalSection icon={RefreshCw}>
      <H2>11. Changes to This Policy</H2>
      <P>
        We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date will change, and
        continued use of our services after changes constitutes acceptance where permitted by law.
      </P>
    </LegalSection>

    <LegalSection icon={Mail}>
      <H2>12. Contact Us</H2>
      <P>For privacy-related questions or requests, contact:</P>
      <UL>
        <LI>
          Email: <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a>
        </LI>
        <LI>
          Phone: <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
      </UL>
    </LegalSection>
  </LegalDocLayout>
);

export default PrivacyPolicyPage;
