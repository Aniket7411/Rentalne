import React from 'react';
import {
  Package,
  Clock,
  MapPin,
  Receipt,
  ClipboardList,
  Truck,
  Wrench,
  AlertTriangle,
  RotateCcw,
  Plane,
  CloudLightning,
  RefreshCw,
  Mail,
} from 'lucide-react';
import LegalDocLayout from '../components/LegalDocLayout';
import { LegalSection } from '../components/LegalSection';

const P = ({ children }) => <p className="text-text-dark/90 leading-relaxed">{children}</p>;
const H2 = ({ children }) => <h2 className="text-lg font-bold text-text-dark">{children}</h2>;
const H3 = ({ children }) => <h3 className="text-base font-semibold text-text-dark pt-2">{children}</h3>;
const UL = ({ children }) => <ul className="list-disc space-y-1 pl-6 text-text-dark/90">{children}</ul>;
const LI = ({ children }) => <li>{children}</li>;

const ShippingPolicyPage = () => (
  <LegalDocLayout title="Shipping Policy" lastUpdated="March 28, 2026" icon={Package}>
    <LegalSection icon={Package}>
      <H2>1. Overview</H2>
      <P>
        This Shipping Policy describes timelines, charges, and procedures for delivering rental products booked through
        ASH Enterprises. It applies alongside your order confirmation and rental agreement.
      </P>
    </LegalSection>

    <LegalSection icon={Clock}>
      <H2>2. Shipping timeline</H2>
      <H3>2.1 Standard</H3>
      <P>
        Standard timelines are typically 2–3 business days from order confirmation (excluding weekends and public
        holidays). Orders placed late in the day or on weekends may start processing the next business day.
      </P>
      <H3>2.2 Expedited</H3>
      <P>
        Same-day or next-day options may be offered in select metros when available. Extra fees apply and are shown at
        checkout.
      </P>
    </LegalSection>

    <LegalSection icon={MapPin}>
      <H2>3. Coverage &amp; address</H2>
      <P>
        We ship within India to locations covered by our partner network. Please provide a complete address, landmark,
        floor/unit, pincode, and a reachable phone number. Inaccessible routes or high floors without lifts may attract
        additional charges.
      </P>
    </LegalSection>

    <LegalSection icon={Receipt}>
      <H2>4. Shipping charges</H2>
      <P>
        Charges depend on distance, urgency, product size, and access. Promotions may offer free standard shipping on
        qualifying orders. All charges are displayed before you pay. Shipping fees are usually non-refundable after
        dispatch unless required under our cancellation policy.
      </P>
    </LegalSection>

    <LegalSection icon={ClipboardList}>
      <H2>5. Order processing &amp; tracking</H2>
      <P>
        You will receive confirmation and updates by SMS/email, including dispatch and delivery coordination. You can
        track status from your account where available or contact support with your order id.
      </P>
    </LegalSection>

    <LegalSection icon={Truck}>
      <H2>6. Delivery day</H2>
      <UL>
        <LI>Team arrives in the agreed window; product handed over as per checklists</LI>
        <LI>Installation may be bundled; technicians conduct basic testing</LI>
        <LI>Someone must be present to accept and sign where required</LI>
        <LI>Failed attempts may lead to reschedule fees</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Wrench}>
      <H2>7. Installation</H2>
      <P>
        When included, installation follows the same professional standards as our Delivery &amp; Service Policy.
        Extra materials or electrical work may be billed separately after consent.
      </P>
    </LegalSection>

    <LegalSection icon={AlertTriangle}>
      <H2>8. Delays &amp; failed delivery</H2>
      <P>
        We will notify you of delays we cause; timelines may shift due to weather or logistics. Missed deliveries after
        reasonable contact attempts may be rescheduled with possible extra charges. You may cancel per our cancellation
        rules if a delay is unacceptable.
      </P>
    </LegalSection>

    <LegalSection icon={RotateCcw}>
      <H2>9. Damaged goods &amp; returns</H2>
      <P>
        Do not accept visibly damaged shipments—note and report immediately with photos. Replacements or refunds follow
        our Cancellation &amp; Refund Policy. Return pickup timelines are communicated case by case.
      </P>
    </LegalSection>

    <LegalSection icon={Plane}>
      <H2>10. International shipping</H2>
      <P>We currently deliver only within India. International shipping is not available.</P>
    </LegalSection>

    <LegalSection icon={CloudLightning}>
      <H2>11. Force majeure</H2>
      <P>
        We are not liable for delays due to disasters, restrictions, strikes, or other events beyond our control. We will
        reschedule when safe and practical.
      </P>
    </LegalSection>

    <LegalSection icon={RefreshCw}>
      <H2>12. Changes</H2>
      <P>
        We may update this policy on the website. Continued use after updates means you accept the revised terms where
        the law allows.
      </P>
    </LegalSection>

    <LegalSection icon={Mail}>
      <H2>13. Contact</H2>
      <UL>
        <LI>
          Email: <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a>
        </LI>
        <LI>
          Phone: <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
        <LI>Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST</LI>
      </UL>
    </LegalSection>
  </LegalDocLayout>
);

export default ShippingPolicyPage;
