import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-[calc(5rem+var(--safe-area-top))] pb-20 max-w-3xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2 mt-8">HIREDAY – Privacy Policy</h1>

        <section className="mt-8 space-y-6 text-foreground/90 text-sm leading-relaxed">
          <p>Your privacy is important to us. This Privacy Policy explains how HIREDAY collects, uses, and protects your personal information when you use our platform.</p>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Name, email address, phone number</li>
              <li>Location and address details</li>
              <li>Profile information (skills, experience, photos)</li>
              <li>Usage data and device information</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and improve our services</li>
              <li>To connect workers with employers</li>
              <li>To communicate important updates</li>
              <li>To ensure platform safety and security</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Data Sharing</h2>
            <p>We do not sell your personal data. Information may be shared only when required by law or with your explicit consent.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data from unauthorized access, alteration, or destruction.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and update your personal information</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of promotional communications</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us through the platform.</p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
