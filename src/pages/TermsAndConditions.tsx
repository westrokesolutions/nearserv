import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2 mt-8">HIREDAY – Terms & Conditions</h1>

        <section className="mt-8 space-y-6 text-foreground/90 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>Welcome to HIREDAY. By accessing or using our platform (website/mobile application), you agree to comply with and be bound by these Terms & Conditions.</p>
            <p className="mt-2">HIREDAY is a digital platform that connects workers, professionals, and employers for short-term or daily work opportunities.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Nature of Platform</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>HIREDAY acts only as a facilitator between workers and employers.</li>
              <li>We do not employ any worker.</li>
              <li>We do not guarantee jobs or hiring.</li>
              <li>We do not act as a contractor or employer.</li>
              <li>All agreements are directly between the worker and the employer.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Users must be at least 18 years old.</li>
              <li>Users must provide accurate and complete information.</li>
              <li>Fake or misleading information may lead to account suspension.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Worker Terms</h2>
            <p>By registering as a worker or professional on HIREDAY:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>You are an independent service provider, not an employee of HIREDAY.</li>
              <li>You are responsible for your work quality, behavior and conduct, and your safety and tools.</li>
            </ul>
            <p className="mt-2">HIREDAY is not responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Any disputes with employers.</li>
              <li>Injury, damage, or loss during work.</li>
              <li>Non-payment issues (unless payment is processed through the platform system).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Employer Terms</h2>
            <p>By using HIREDAY to hire workers, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Provide accurate job details.</li>
              <li>Pay agreed wages on time.</li>
              <li>Maintain a safe working environment.</li>
            </ul>
            <p className="mt-2">Employers are fully responsible for worker payments, work conditions, and any disputes or incidents. HIREDAY is not liable for employer-worker conflicts.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Payment Terms</h2>
            <p>HIREDAY does not charge any fees from professionals, employers, customers, or any person using the service.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Prohibited Activities</h2>
            <p>Users must not:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Post false or misleading job information.</li>
              <li>Engage in illegal activities.</li>
              <li>Harass, abuse, or exploit other users.</li>
              <li>Use the platform for fraud or unauthorized purposes.</li>
            </ul>
            <p className="mt-2">Violation may lead to account suspension or permanent ban.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Ratings & Reviews</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Users may provide ratings and feedback.</li>
              <li>Reviews must be honest and fair.</li>
              <li>HIREDAY reserves the right to remove inappropriate content.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Limitation of Liability</h2>
            <p>HIREDAY is not responsible for:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Any injury, damage, or loss during work.</li>
              <li>Quality of services provided.</li>
              <li>Payment disputes between users.</li>
              <li>Any indirect or consequential damages.</li>
            </ul>
            <p className="mt-2">Use of the platform is at your own risk.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Account Suspension</h2>
            <p>HIREDAY reserves the right to suspend or terminate accounts, remove users violating policies, and restrict access without prior notice.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Privacy</h2>
            <p>User data is collected and used as per our Privacy Policy. We do not share personal information without consent (except when required by law).</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Changes to Terms</h2>
            <p>HIREDAY may update these Terms at any time. Continued use of the platform means you accept the updated terms.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">13. Governing Law</h2>
            <p>These Terms shall be governed by the laws of India.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
