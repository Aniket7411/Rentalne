import React from 'react';
import {
  RotateCcw,
  Info,
  Snowflake,
  Wrench,
  Banknote,
  Phone,
  AlertTriangle,
  Ban,
  FileX,
  Scale,
  Mail,
} from 'lucide-react';
import LegalDocLayout from '../components/LegalDocLayout';
import { LegalSection } from '../components/LegalSection';

const P = ({ children }) => <p className="text-text-dark/90 leading-relaxed">{children}</p>;
const H2 = ({ children }) => <h2 className="text-lg font-bold text-text-dark">{children}</h2>;
const H3 = ({ children }) => <h3 className="text-base font-semibold text-text-dark">{children}</h3>;
const UL = ({ children }) => <ul className="list-disc space-y-1 pl-6 text-text-dark/90">{children}</ul>;
const LI = ({ children }) => <li>{children}</li>;

const CancellationRefundPage = () => (
  <LegalDocLayout title="Cancellation &amp; Refund Policy" lastUpdated="March 28, 2026" icon={RotateCcw}>
    <LegalSection icon={Info}>
      <H2>1. Overview</H2>
      <P>
        This Cancellation &amp; Refund Policy outlines the terms and conditions for canceling orders and requesting
        refunds for AC rentals and services booked through ASH Enterprises. Please read this policy carefully before
        making a booking.
      </P>
    </LegalSection>

    <LegalSection icon={Snowflake}>
      <H2>2. AC Rental Cancellations</H2>
      <H3>2.1 Before Delivery</H3>
      <P>If you cancel your AC rental booking before the AC is delivered:</P>
      <UL>
        <LI>
          <strong>Full Refund:</strong> Cancellation 48 hours or more before scheduled delivery — 100% refund
        </LI>
        <LI>
          <strong>Partial Refund:</strong> Cancellation between 24–48 hours before delivery — 80% refund
        </LI>
        <LI>
          <strong>No Refund:</strong> Cancellation less than 24 hours before delivery — no refund (delivery charges may
          apply)
        </LI>
      </UL>
      <H3>2.2 After Delivery</H3>
      <P>If you wish to cancel after the AC has been delivered and installed:</P>
      <UL>
        <LI>Cancellation within 24 hours of installation — 70% refund (after deduction of delivery and installation charges)</LI>
        <LI>Cancellation within 3 days — 50% refund (after deduction of delivery, installation, and service charges)</LI>
        <LI>Cancellation after 3 days — no refund (rental contract continues for the agreed period)</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Wrench}>
      <H2>3. Service Booking Cancellations</H2>
      <H3>3.1 Before Service</H3>
      <P>If you cancel your service booking before the service is rendered:</P>
      <UL>
        <LI>
          <strong>Full Refund:</strong> Cancellation 24 hours or more before scheduled service — 100% refund
        </LI>
        <LI>
          <strong>Partial Refund:</strong> Cancellation 4–24 hours before service — 50% refund
        </LI>
        <LI>
          <strong>No Refund:</strong> Cancellation less than 4 hours before service or no-show — no refund
        </LI>
      </UL>
      <H3>3.2 After Service Commencement</H3>
      <P>Once the service has commenced:</P>
      <UL>
        <LI>If service is incomplete due to customer request — charges for work completed will apply, balance refunded</LI>
        <LI>If service is incomplete due to technical issues — full refund or service completion at no extra charge</LI>
        <LI>If service is completed — no refund (except for warranty claims as per service terms)</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Banknote}>
      <H2>4. Refund Processing</H2>
      <H3>4.1 Refund Method</H3>
      <P>Refunds will be processed to the original payment method used for the transaction:</P>
      <UL>
        <LI>Credit/Debit Cards — 5–7 business days</LI>
        <LI>Net Banking — 3–5 business days</LI>
        <LI>UPI/Wallets — 2–3 business days</LI>
        <LI>Cash on Delivery — refund via bank transfer (account details required) — 7–10 business days</LI>
      </UL>
      <H3>4.2 Processing Time</H3>
      <P>
        Once your cancellation request is approved, refunds are typically processed within the timeframes mentioned above.
        Actual credit to your account may take additional time depending on your bank or payment provider.
      </P>
    </LegalSection>

    <LegalSection icon={Phone}>
      <H2>5. How to Cancel</H2>
      <P>You can cancel your booking through the following methods:</P>
      <UL>
        <LI>
          <strong>Online:</strong> Log into your account and cancel from the Orders section
        </LI>
        <LI>
          <strong>Email:</strong> Send a cancellation request to{' '}
          <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a> with your order number
        </LI>
        <LI>
          <strong>Phone:</strong> Call our customer service at <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
      </UL>
      <P>
        All cancellation requests must include your order number and reason for cancellation. Cancellation requests will
        be processed within 24–48 hours of receipt.
      </P>
    </LegalSection>

    <LegalSection icon={AlertTriangle}>
      <H2>6. Special Circumstances</H2>
      <H3>6.1 Vendor Cancellation</H3>
      <P>
        If a vendor cancels your booking, you will receive a full refund and assistance in finding an alternative
        solution.
      </P>
      <H3>6.2 Force Majeure</H3>
      <P>
        In cases of natural disasters, pandemics, or other force majeure events preventing service delivery, we will work
        with you to reschedule or provide full refunds as applicable.
      </P>
      <H3>6.3 Defective Products</H3>
      <P>
        If you receive a defective AC or unsatisfactory service, please contact us immediately. We will arrange for
        replacement, repair, or full refund based on the circumstances.
      </P>
    </LegalSection>

    <LegalSection icon={Ban}>
      <H2>7. Non-Refundable Charges</H2>
      <P>The following charges are typically non-refundable:</P>
      <UL>
        <LI>Delivery charges (if cancellation occurs after dispatch)</LI>
        <LI>Installation charges (if installation has been completed)</LI>
        <LI>Service fees for completed work</LI>
        <LI>Any damage charges or penalties as per rental agreement</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={FileX}>
      <H2>8. Early Termination of Rental</H2>
      <P>For early termination of active rental agreements:</P>
      <UL>
        <LI>Early termination fees may apply as per the rental agreement</LI>
        <LI>Outstanding rental charges up to the date of termination must be paid</LI>
        <LI>Refund of advance payments, if any, will be calculated after deducting applicable charges</LI>
        <LI>AC must be returned in good condition (normal wear and tear excepted)</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Scale}>
      <H2>9. Dispute Resolution</H2>
      <P>If you are not satisfied with a cancellation or refund decision, you can:</P>
      <UL>
        <LI>Contact our customer service team with your concerns</LI>
        <LI>Submit a written complaint with supporting documents</LI>
        <LI>We will review your case and respond within 5–7 business days</LI>
        <LI>If unresolved, disputes will be handled as per our Terms &amp; Conditions</LI>
      </UL>
    </LegalSection>

    <LegalSection icon={Mail}>
      <H2>10. Contact Information</H2>
      <P>For cancellation requests, refund inquiries, or questions about this policy, please contact us:</P>
      <UL>
        <LI>
          Email: <a href="mailto:support@ashenterprises.in">support@ashenterprises.in</a>
        </LI>
        <LI>
          Phone: <a href="tel:+918169535736">+91 8169535736</a>
        </LI>
      </UL>
      <P className="text-text-light mt-3 text-sm">Business hours: Monday – Saturday, 9:00 AM – 6:00 PM IST</P>
    </LegalSection>
  </LegalDocLayout>
);

export default CancellationRefundPage;
