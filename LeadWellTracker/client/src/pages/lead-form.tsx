import { LeadCaptureForm } from "@/components/lead-capture/LeadCaptureForm";

export default function LeadFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Contact Our Construction Experts
            </span>
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Our team of experienced professionals can help you bring your construction project to life.
            Share your project details with us to receive a personalized consultation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Why Choose LeadWell Construction?</h2>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>25+ years of industry experience</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Licensed and insured professionals</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>On-time and on-budget project delivery</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Transparent communication throughout</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span>Cutting-edge technology and techniques</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900">Our Services</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">Residential Construction</div>
                <div className="bg-gray-50 p-3 rounded">Commercial Office Builds</div>
                <div className="bg-gray-50 p-3 rounded">Industrial Facilities</div>
                <div className="bg-gray-50 p-3 rounded">Renovation Projects</div>
                <div className="bg-gray-50 p-3 rounded">Project Management</div>
                <div className="bg-gray-50 p-3 rounded">Design Consultation</div>
              </div>
            </div>
          </div>

          <LeadCaptureForm 
            title="Request a Consultation"
            description="Fill out this quick form and our team will get back to you within 24 hours with a personalized consultation."
            formType="consultation"
            source="website_consultation_page"
          />
        </div>

        <div className="text-center text-sm text-gray-500 mt-12 pt-6 border-t border-gray-200">
          <p>© 2025 LeadWell Construction. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}