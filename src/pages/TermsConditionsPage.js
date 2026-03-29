import React from 'react';
import {
  Scale,
  FileCheck,
  Briefcase,
  UserCircle,
  Home,
  Wrench,
  Wallet,
  ShieldAlert,
  Gavel,
  Copyright,
  RefreshCw,
  UserX,
  Globe,
  Mail,
} from 'lucide-react';
import LegalDocLayout from '../components/LegalDocLayout';
import { LegalSection } from '../components/LegalSection';

const P = ({ children }) => <p className="text-text-dark/90 leading-relaxed">{children}</p>;
const H2 = ({ children }) => <h2 className="text-lg font-bold text-text-dark">{children}</h2>;
const UL = ({ children }) => <ul className="list-disc space-y-1 pl-6 text-text-dark/90">{children}</ul>;
const LI = ({ children }) => <li>{children}</li>;

const TermsConditionsPage = () => (
  <LegalDocLayout title="Terms &amp; Conditions" lastUpdated="March 28, 2026" icon={Scale}>
    <LegalSection icon={FileCheck}>
      <H2>1. Acceptance of Terms</H2>
      <P>
        By accessing and using ASH Enterprises&apos; website and services, you accept and agree to be bound by
        the terms and provision of this agreement. If you do not agree to abide by the above, please do not use
        this service.
      </P>
    </LegalSection>

    <LegalSection icon={Briefcase}>
      <H2>2. Description of Service</H2>
      <P>
        ASH Enterprises provides a platform for AC rentals and repair services. We connect customers with vendors
        who offer AC rental and maintenance services. We act as an intermediary platform and do not own the ACs
        listed on our platform.
      </P>
    </LegalSection>

    <LegalSection icon={UserCircle}>
      <H2>3. User Accounts</H2>
      <P>To access certain features of our service, you may be required to create an account. You are responsible for:</P>
      <UL>
        <LI>Maintaining the confidentiality of your account credentials</LI>
        <LI>All activities that occur under your account</LI>
        <LI>Providing accurate and complete information</LI>
        <LI>Updating your information promptly if any changes occur</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Home}>
      <H2>4. Rental Terms</H2>
      <P>When renting an AC through our platform:</P>
      <UL>
        <LI>Rental periods are as specified in the rental agreement (monthly, quarterly, or yearly)</LI>
        <LI>Renters are responsible for the proper care and maintenance of the AC during the rental period</LI>
        <LI>Any damage beyond normal wear and tear may result in additional charges</LI>
        <LI>Early termination may be subject to penalties as per the rental agreement</LI>
        <LI>Vendors are responsible for delivery and installation of ACs</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Wrench}>
      <H2>5. Service Terms</H2>
      <P>For repair and maintenance services:</P>
      <UL>
        <LI>Service requests are subject to vendor availability</LI>
        <LI>Service charges are as quoted at the time of booking</LI>
        <LI>Additional charges may apply if additional work is required</LI>
        <LI>Warranty terms are as specified by the service provider</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Wallet}>
      <H2>6. Payment Terms</H2>
      <UL>
        <LI>Payment must be made through our secure payment gateway</LI>
        <LI>Rental payments may be required in advance or as per the rental agreement</LI>
        <LI>Service payments are typically due upon completion of service</LI>
        <LI>All prices are in Indian Rupees (INR) unless otherwise stated</LI>
        <LI>Refunds, if applicable, will be processed according to our Cancellation &amp; Refund Policy</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={ShieldAlert}>
      <H2>7. User Conduct</H2>
      <P>You agree not to:</P>
      <UL>
        <LI>Use the service for any illegal or unauthorized purpose</LI>
        <LI>Violate any laws in your jurisdiction</LI>
        <LI>Transmit any viruses, malware, or harmful code</LI>
        <LI>Interfere with or disrupt the service or servers</LI>
        <LI>Attempt to gain unauthorized access to any portion of the service</LI>
        <LI>Impersonate any person or entity</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Gavel}>
      <H2>8. Limitation of Liability</H2>
      <P>ASH Enterprises acts as an intermediary platform and shall not be liable for:</P>
      <UL>
        <LI>Any disputes between customers and vendors</LI>
        <LI>Quality of products or services provided by vendors</LI>
        <LI>Any damage or loss resulting from the use of rented ACs</LI>
        <LI>Delays or failures in service delivery</LI>
        <LI>Any indirect, incidental, or consequential damages</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Copyright}>
      <H2>9. Intellectual Property</H2>
      <P>
        All content on this platform, including text, graphics, logos, and software, is the property of ASH
        Enterprises or its content suppliers and is protected by copyright and other intellectual property laws.
      </P>
    </LegalSection>

    <LegalSection icon={RefreshCw}>
      <H2>10. Modifications to Terms</H2>
      <P>
        We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting
        on our website. Your continued use of the service after changes constitutes acceptance of the modified
        terms.
      </P>
    </LegalSection>

    <LegalSection icon={UserX}>
      <H2>11. Termination</H2>
      <P>
        We reserve the right to terminate or suspend your account and access to the service at our sole discretion,
        without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third
        parties.
      </P>
    </LegalSection>

    <LegalSection icon={Globe}>
      <H2>12. Governing Law</H2>
      <P>
        These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from
        these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, India.
      </P>
    </LegalSection>

    <LegalSection icon={Mail}>
      <H2>13. Contact Information</H2>
      <P>If you have any questions about these Terms &amp; Conditions, please contact us at:</P>
      <UL>
        <LI>
          Email:{' '}
          <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a>
        </LI>
        <LI>
          Phone:{' '}
          <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
      </UL>
    </LegalSection>
  </LegalDocLayout>
);

export default TermsConditionsPage;
