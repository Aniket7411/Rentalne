import React from 'react';
import {
  Truck,
  Clock,
  MapPin,
  Wrench,
  Calendar,
  UserCheck,
  RefreshCw,
  BadgeCheck,
  AlertCircle,
  CloudLightning,
} from 'lucide-react';
import LegalDocLayout, { ADDRESS } from '../components/LegalDocLayout';
import { LegalSection } from '../components/LegalSection';

const P = ({ children }) => <p className="text-text-dark/90 leading-relaxed">{children}</p>;
const H2 = ({ children }) => <h2 className="text-lg font-bold text-text-dark">{children}</h2>;
const H3 = ({ children }) => <h3 className="text-base font-semibold text-text-dark pt-2">{children}</h3>;
const UL = ({ children }) => <ul className="list-disc space-y-1 pl-6 text-text-dark/90">{children}</ul>;
const LI = ({ children }) => <li>{children}</li>;

const DeliveryServicePage = () => (
  <LegalDocLayout title="Delivery &amp; Service Policy" lastUpdated="March 28, 2026" icon={Truck}>
    <LegalSection icon={Truck}>
      <H2>1. Overview</H2>
      <P>
        This policy outlines delivery of AC rentals and how repair and maintenance services are carried out through ASH
        Enterprises. It is designed to set clear expectations for customers.
      </P>
    </LegalSection>

    <LegalSection icon={Clock}>
      <H2>2. AC rental delivery</H2>
      <H3>2.1 Delivery timeline</H3>
      <UL>
        <LI>Same-day delivery may be available in select areas for orders placed before 12:00 PM (subject to availability)</LI>
        <LI>Next-day delivery is standard for many locations</LI>
        <LI>Remote areas may require 2–3 business days</LI>
        <LI>Timelines are estimates and may vary based on location and external factors</LI>
      </UL>
      <H3>2.2 Delivery process</H3>
      <UL>
        <LI>Order confirmation via email/SMS with details</LI>
        <LI>Pre-delivery call to confirm address and schedule</LI>
        <LI>Physical delivery of the unit</LI>
        <LI>Installation by certified technicians where included</LI>
        <LI>Testing, demonstration, and handover of documents</LI>
      </UL>
      <H3>2.3 Areas &amp; charges</H3>
      <P>
        We deliver to major cities and metros; coverage depends on our network. Extra charges may apply for distance,
        urgency, floor access, or special time slots. Charges are shown before you confirm your order.
      </P>
    </LegalSection>

    <LegalSection icon={Wrench}>
      <H2>3. Installation</H2>
      <P>
        Standard installation typically includes wall mounting, electrical connections, and drainage setup where
        applicable. Extra piping, special mounts, or electrical work may incur additional charges. Workmanship may be
        covered under a separate installation warranty.
      </P>
    </LegalSection>

    <LegalSection icon={Calendar}>
      <H2>4. Service appointments</H2>
      <H3>4.1 Scheduling</H3>
      <UL>
        <LI>Requests are usually confirmed within a few hours; vendors may call within 24 hours to schedule</LI>
        <LI>Typical slots: morning, afternoon, or evening</LI>
        <LI>Emergency service may be available at extra cost</LI>
      </UL>
      <H3>4.2 During the visit</H3>
      <UL>
        <LI>Technicians aim to arrive in the agreed window and carry ID</LI>
        <LI>You receive an explanation and cost estimate before paid work begins</LI>
        <LI>Work uses quality materials; testing and documentation provided where applicable</LI>
      </UL>
      <H3>4.3 Service types</H3>
      <P>Repairs, maintenance, installation, uninstallation, and priority emergency visits (where offered).</P>
    </LegalSection>

    <LegalSection icon={UserCheck}>
      <H2>5. Customer responsibilities</H2>
      <UL>
        <LI>Accurate address and reachable phone number</LI>
        <LI>Someone available at the scheduled time</LI>
        <LI>Clear, safe access to the appliance</LI>
        <LI>Power available where needed</LI>
        <LI>Payment as agreed</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={RefreshCw}>
      <H2>6. Rescheduling &amp; cancellations</H2>
      <P>
        Free rescheduling is often possible if requested in advance. Late changes or no-shows may incur fees. Cancellations
        follow our Cancellation &amp; Refund Policy.
      </P>
    </LegalSection>

    <LegalSection icon={BadgeCheck}>
      <H2>7. Quality assurance</H2>
      <P>
        We work with trained technicians and monitor feedback. Services may include workmanship warranty as stated on
        your booking or invoice.
      </P>
    </LegalSection>

    <LegalSection icon={AlertCircle}>
      <H2>8. Issues &amp; complaints</H2>
      <P>
        Report problems promptly with your order or service reference. We aim to investigate and respond within 24–48
        hours. If the issue is on our side, we will offer a suitable remedy.
      </P>
    </LegalSection>

    <LegalSection icon={CloudLightning}>
      <H2>9. Force majeure</H2>
      <P>
        We are not liable for delays caused by events outside reasonable control (weather, restrictions, strikes, etc.).
        We will help reschedule as soon as possible.
      </P>
    </LegalSection>

    <LegalSection icon={MapPin}>
      <H2>10. Contact</H2>
      <P>For delivery or service support:</P>
      <UL>
        <LI>
          Email: <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a>
        </LI>
        <LI>
          Phone: <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
        <LI>Address: {ADDRESS}</LI>
        <LI>Hours: Monday – Saturday, 9:00 AM – 6:00 PM IST (emergency lines may differ)</LI>
      </UL>
    </LegalSection>
  </LegalDocLayout>
);

export default DeliveryServicePage;
