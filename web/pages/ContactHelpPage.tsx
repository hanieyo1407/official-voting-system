// web/pages/ContactHelpPage.tsx (NEW FILE)

import React from 'react';
import Card from '../components/Card';
import { Mail, Phone, MapPin } from 'lucide-react'; // Assuming Lucide-React is available for modern icons

const ContactHelpPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh]">
            <Card className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Contact & Support</h1>
                
                <div className="space-y-8 text-gray-700">
                    <p className="text-lg font-medium text-center">
                        If you encounter any issues with voting, verification, or have security concerns, please contact the appropriate team immediately.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {/* Technical Support */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <Mail className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
                            <h2 className="text-xl font-bold text-dmi-blue-800">Technical Support</h2>
                            <p className="text-sm mt-2">For website errors, voucher issues, or technical help.</p>
                            <a href="mailto:it-support@sjbu-voting.com" className="block mt-4 text-dmi-blue-600 hover:underline font-semibold">it-support@sjbu-voting.com</a>
                        </div>
                        
                        {/* Election Committee */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <Phone className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
                            <h2 className="text-xl font-bold text-dmi-blue-800">Election Committee</h2>
                            <p className="text-sm mt-2">For eligibility, rules, and general election inquiries.</p>
                            <p className="block mt-4 text-dmi-blue-600 font-semibold">+265 999 123 456</p>
                        </div>
                        
                        {/* Physical Location */}
                        <div className="p-4 border rounded-lg shadow-sm">
                            <MapPin className="w-10 h-10 text-dmi-blue-600 mx-auto mb-3" />
                            <h2 className="text-xl font-bold text-dmi-blue-800">Physical Location</h2>
                            <p className="text-sm mt-2">Find the official help desk.</p>
                            <p className="block mt-4 text-dmi-blue-600 font-semibold">SJBU Main Campus - Student Union Office</p>
                        </div>
                    </div>
                </div>

            </Card>
        </div>
    );
};

export default ContactHelpPage;