// web/pages/PrivacyPolicyPage.tsx (NEW FILE)

import React from 'react';
import Card from '../components/Card';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh]">
            <Card className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Privacy Policy</h1>
                
                <div className="space-y-6 text-gray-700">
                    <p className="text-lg font-medium">
                        The DMI-SJBU Voting System is committed to voter anonymity and data security.
                    </p>

                    <h2 className="text-xl font-bold text-dmi-blue-800">1. Data Collection and Anonymity</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>We only collect a **Voter Voucher ID** for eligibility verification.</li>
                        <li>The final **Vote Record** is stored entirely separate from the Voter Voucher ID.</li>
                        <li>The system employs a strict **double-blind** protocol: the system cannot link a cast vote to the identity of the voter, nor can it link the identity to the vote.</li>
                    </ul>
                    
                    <h2 className="text-xl font-bold text-dmi-blue-800">2. Data Security</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>All vote records are stored in a secure, encrypted database pool.</li>
                        <li>The system uses **HTTP-only cookies** for Admin authentication, preventing client-side access.</li>
                        <li>Vote verification codes are provided to the voter and can only confirm the vote's successful submission, not the content of the vote.</li>
                    </ul>

                    <p className="pt-4 border-t mt-6 text-sm">
                        By using this system, you agree to the terms of this Privacy Policy. This policy is subject to review by the SJBU Development Team.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default PrivacyPolicyPage;