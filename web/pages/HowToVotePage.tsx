// web/pages/HowToVotePage.tsx (NEW FILE)

import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const HowToVotePage: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 min-h-[70vh]">
            <Card className="max-w-4xl mx-auto p-8">
                <h1 className="text-3xl font-extrabold text-dmi-blue-900 mb-6 border-b pb-3 text-center">How To Vote</h1>
                
                <div className="space-y-6 text-gray-700">
                    <p className="text-lg font-medium">
                        Welcome to the DMI-SJBU Voting System. Follow these simple steps to cast your secure and verified vote:
                    </p>

                    <ol className="list-decimal list-inside space-y-4 ml-4">
                        <li>
                            <strong className="text-dmi-blue-800">Obtain Your Voucher:</strong> A unique, single-use voter voucher will be distributed by the election committee to all eligible students. Keep this voucher secure.
                        </li>
                        <li>
                            <strong className="text-dmi-blue-800">Authenticate:</strong> Navigate to the <span className="font-mono bg-gray-200 px-1 rounded">Verify Vote</span> page and enter your unique voucher code. The system will verify your eligibility.
                        </li>
                        <li>
                            <strong className="text-dmi-blue-800">Cast Your Ballot:</strong> Once authenticated, you will be taken to the voting page. Select one candidate for each position (e.g., President, Vice-President). All selections are mandatory.
                        </li>
                        <li>
                            <strong className="text-dmi-blue-800">Review and Submit:</strong> Before the final submission, you will be directed to a Review Page. Check that all your selections are correct. Once you click 'Submit Ballot', your vote is final and irreversible.
                        </li>
                        <li>
                            <strong className="text-dmi-blue-800">Receive Verification Code:</strong> After a successful submission, you will receive a unique Verification Code. Use this code on the <span className="font-mono bg-gray-200 px-1 rounded">Verify Vote</span> page to confirm your vote was recorded correctly.
                        </li>
                    </ol>

                    <div className="pt-4 mt-6 border-t">
                        <p className="font-semibold text-dmi-blue-800">Security Note:</p>
                        <p className="text-sm">Your vote is anonymous. The voucher and verification code are only linked to an anonymous entry, ensuring your identity remains private while maintaining the integrity of the election.</p>
                    </div>
                </div>

            </Card>
        </div>
    );
};

export default HowToVotePage;