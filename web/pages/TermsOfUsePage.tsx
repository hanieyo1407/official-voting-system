// web/pages/TermsOfUsePage.tsx (NEW FILE)

import React from 'react';
import Card from '../components/Card';

const TermsOfUsePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh]">
            <Card className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">Terms of Use</h1>
                
                <div className="space-y-6 text-gray-700">
                    <p className="text-lg font-medium">
                        These terms govern your use of the DMI-SJBU Voting System.
                    </p>

                    <h2 className="text-xl font-bold text-dmi-blue-800">1. Eligibility</h2>
                    <p>Only individuals issued a unique, verifiable voter voucher by the DMI-SJBU Election Committee are eligible to cast a vote.</p>

                    <h2 className="text-xl font-bold text-dmi-blue-800">2. Single Vote Rule</h2>
                    <p>Each eligible voter is permitted to cast their ballot **once**. Attempting to vote multiple times using fraudulent or unauthorized vouchers is a violation of these terms and may result in disciplinary action.</p>

                    <h2 className="text-xl font-bold text-dmi-blue-800">3. Finality of Submission</h2>
                    <p>Once the 'Submit Ballot' button is clicked and confirmed, the vote is immediately recorded and **cannot be altered or retracted**.</p>
                    
                    <h2 className="text-xl font-bold text-dmi-blue-800">4. Misuse and Integrity</h2>
                    <p>Any attempt to tamper with the voting system, bypass security measures, or introduce external data is strictly prohibited and will be prosecuted under the full extent of university rules.</p>


                    <p className="pt-4 border-t mt-6 text-sm">
                        By proceeding, you affirm that you have read and agree to these Terms of Use.
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default TermsOfUsePage;