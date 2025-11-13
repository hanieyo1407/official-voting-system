import React, { useState, useEffect } from 'react';
import { Page, Candidate, Position,  } from '../types'; 
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner'; 
import sjbuApi from '../src/api/sjbuApi'; 
import { isAxiosError } from 'axios';
import { useAllPositions } from '@/hooks/useAllPositions';
// Define VoteSelection locally to use numeric keys/values
interface VoteSelection {
  [positionId: number]: number; // Only allows number (Candidate ID) - Mandatory selection
}

interface PositionWithCandidates extends Position { 
    candidates: Candidate[];
}

interface VotingPageProps {
  positions: PositionWithCandidates[]; 
  userVoucher: string; 
  setPage: (page: Page) => void;
  setVerificationCode: (code: string) => void;
  isOffline: boolean;
}

const VotingPage: React.FC<VotingPageProps> = ({ positions, userVoucher, setPage, setVerificationCode, isOffline }) => {
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  // Initial state should reflect no selection, not a placeholder
  const [selections, setSelections] = useState<VoteSelection>({}); 
  const [view, setView] = useState<'voting' | 'review'>('voting');
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const [isManifestoModalOpen, setIsManifestoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalCandidate, setModalCandidate] = useState<Candidate | null>(null);

  // useEffect for localStorage load/save remains the same, adapted for number keys
  useEffect(() => {
    try {
      const savedSelections = localStorage.getItem('dmi-vote-selections');
      if (savedSelections) {
          const parsedSelections = JSON.parse(savedSelections);
          const numericKeySelections = Object.keys(parsedSelections).reduce((acc: VoteSelection, key) => {
              // Ensure selection is not 'abstain' if loading old data
              if (parsedSelections[key] !== 'abstain') {
                acc[parseInt(key, 10)] = parsedSelections[key];
              }
              return acc;
          }, {} as VoteSelection);
        setSelections(numericKeySelections);
      }
    } catch (error) {
      console.error("Could not load selections from local storage", error);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(selections).length > 0) {
      try {
        localStorage.setItem('dmi-vote-selections', JSON.stringify(selections));
      } catch (error) {
        console.error("Could not save selections to local storage", error);
      }
    }
  }, [selections]);


  const currentPosition = positions[currentPositionIndex];

  // FIXED: Logic to handle only NUMERIC IDs (Candidate ID)
  const handleSelect = (candidateId: number) => {
    setSelections({
      ...selections,
      [currentPosition.id]: candidateId,
    });
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    } else {
      // Final check: Ensure all positions have a selection before review
      if (Object.keys(selections).length < positions.length) {
           alert("Please select a candidate for all positions.");
           return;
      }
      setView('review');
    }
  };

  const handleBack = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(currentPositionIndex - 1);
    }
  };

  // The main function replacement: FINAL CORRECTED SEQUENTIAL SUBMISSION LOGIC
  const handleSubmit = async () => {
      if (isOffline) {
        alert("You are offline. Please reconnect to the internet to submit your vote.");
        return;
      }
      
      // CRITICAL GUARD CLAUSE: Final check to ensure all mandatory positions are selected
      if (!positions || positions.length === 0 || Object.keys(selections).length < positions.length) {
          alert("Submission failed. You must select a candidate for every position.");
          setIsSubmitting(false);
          return;
      }

      setIsSubmitting(true);
      setIsConfirmModalOpen(false);
      
      try {
          // 1. Prepare all vote submission promises (sequential submission)
          const votePromises = Object.keys(selections)
            .map(key => parseInt(key, 10)) // Ensure position ID is a number
            .map(positionId => {
                const candidateId = selections[positionId] as number; // Guaranteed to be a number
                
                // CRITICAL: Send single vote payload per position
                return sjbuApi.post('/vote', {
                    voucher: userVoucher,
                    candidateId: candidateId,
                    positionId: positionId,
                });
            });

          // 2. Execute all vote submissions concurrently
          const results = await Promise.allSettled(votePromises);

          let verificationCode = '';
          let allSuccessful = true;
          
          results.forEach(result => {
              if (result.status === 'fulfilled' && result.value !== null) {
                  // CRITICAL: Use the ORIGINAL verification code path
                  const responseData = result.value.data.data;
                  if (responseData?.verification_code) {
                      verificationCode = responseData.verification_code;
                  }
              } else if (result.status === 'rejected') {
                  console.error('Vote submission failed:', result.reason);
                  console.error("Failed vote reason (if available):", result.reason.response?.data);
                  allSuccessful = false; 
              }
          });

          if (!allSuccessful) {
               alert("One or more votes failed to submit. Please check the console for details.");
               setIsSubmitting(false);
               return;
          }

          if (verificationCode) {
              setVerificationCode(verificationCode);
              setPage(Page.VoteSuccess);
              localStorage.removeItem('dmi-vote-selections');
          } else {
              alert('Submission succeeded but could not retrieve verification code.');
          }
          
      } catch (err) {
          let errorDetails = "Unknown error occurred.";
          if (isAxiosError(err) && err.response) {
               const errorData = err.response.data;
               errorDetails = errorData.error || errorData.message || `Server responded with ${err.response.status}.`;
          } else {
              errorDetails = "Network connection failed. Check your server.";
          }
          
          console.error("FATAL SUBMISSION FAILURE:", errorDetails, err);
          alert(`Submission Failed: ${errorDetails}`);
          
      } finally {
          setIsSubmitting(false);
      }
  };
  
  const openManifesto = (candidate: Candidate) => {
    setModalCandidate(candidate);
    setIsManifestoModalOpen(true);
  };
  
  if (!currentPosition) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Card className="max-w-4xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-dmi-blue-900">Election Data Loading...</h2>
                <p className="text-gray-600 mt-4">If this takes a long time, please refresh the page or contact an administrator.</p>
            </Card>
        </div>
    );
  }

  const renderVotingView = () => (
    <Card className="max-w-4xl mx-auto">
      <div className="p-6 border-b">
        <p className="text-sm text-gray-500">Position {currentPositionIndex + 1} of {positions.length}</p>
        <h2 className="text-2xl font-bold text-dmi-blue-900">{currentPosition.name}</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div className="bg-dmi-blue-600 h-2.5 rounded-full" style={{ width: `${((currentPositionIndex + 1) / positions.length) * 100}%` }}></div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {currentPosition.candidates.map((candidate) => (
          <div
            key={candidate.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${selections[currentPosition.id] === candidate.id ? 'bg-dmi-blue-50 border-dmi-blue-500 ring-2 ring-dmi-blue-500' : 'hover:bg-gray-50'}`}
            onClick={() => handleSelect(candidate.id)} // Pass number ID
          >
            <div className="flex items-center space-x-4">
              <img src={candidate.imageUrl} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
              <div className="flex-grow">
                <h4 className="text-lg font-semibold text-dmi-blue-900">{candidate.name}</h4>
                 <Button variant="secondary" size="sm" className="mt-1" onClick={(e) => { e.stopPropagation(); openManifesto(candidate); }}>View Manifesto</Button>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selections[currentPosition.id] === candidate.id ? 'bg-dmi-blue-600 border-dmi-blue-600' : 'border-gray-300'}`}>
                {selections[currentPosition.id] === candidate.id && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
              </div>
            </div>
          </div>
        ))}
        {/* REMOVED: ABSTAIN BUTTON - per requirement for mandatory selection */}
      </div>
       <div className="p-6 bg-gray-50 flex justify-between items-center">
        <Button variant="secondary" onClick={handleBack} disabled={currentPositionIndex === 0}>Back</Button>
        <Button onClick={handleNext} disabled={!selections[currentPosition.id]}>
          {currentPositionIndex < positions.length - 1 ? 'Next Position' : 'Review Ballot'}
        </Button>
      </div>
    </Card>
  );

  const renderReviewView = () => (
      <Card className="max-w-4xl mx-auto">
          <div className="p-6 border-b text-center">
              <h2 className="text-3xl font-bold text-dmi-blue-900">Review Your Ballot</h2>
              <p className="text-gray-600 mt-2">Please carefully review your selections. Once submitted, votes CANNOT be changed.</p>
          </div>
          <div className="p-6 space-y-4">
              {positions.map((position, index) => {
                  const selectionId = selections[position.id];
                  const candidate = typeof selectionId === 'number' ? position.candidates.find(c => c.id === selectionId) : null;
                  const selectionName = candidate?.name || 'ERROR: No Selection';
                  return (
                      <div key={position.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div>
                              <p className="font-semibold text-dmi-blue-800">{position.name}</p>
                              <p className={`text-lg font-medium ${selectionId === undefined ? 'text-red-500 italic' : 'text-dmi-blue-900'}`}>{selectionName}</p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => { setCurrentPositionIndex(index); setView('voting'); }}>Change</Button>
                      </div>
                  );
              })}
          </div>
          <div className="p-6 bg-gray-50 flex justify-between items-center">
             <Button variant="secondary" onClick={() => setView('voting')}>Go Back to Ballot</Button>
             <Button onClick={() => setIsConfirmModalOpen(true)} disabled={isSubmitting}>
                 {isSubmitting ? <Spinner /> : 'Submit Ballot'}
             </Button>
          </div>
      </Card>
  );

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-center text-white p-2 z-50 shadow-lg" role="alert">
            <div className="container mx-auto flex items-center justify-center">
                 <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L5.636 18.364m12.728-12.728L5.636 5.636"></path></svg>
                <span className="font-semibold">You are currently offline. Your progress is saved on this device. Please reconnect to submit your ballot.</span>
            </div>
        </div>
      )}
      <div className={`container mx-auto px-4 py-8 transition-all ${isOffline ? 'pt-20' : ''}`}>
          {view === 'voting' && renderVotingView()}
          {view === 'review' && renderReviewView()}
          
          <Modal 
              isOpen={isManifestoModalOpen} 
              onClose={() => setIsManifestoModalOpen(false)}
              title={`Manifesto: ${modalCandidate?.name || ''}`}
          >
              <p className="text-gray-600 whitespace-pre-wrap">{modalCandidate?.manifesto}</p>
          </Modal>

          <Modal
              isOpen={isConfirmModalOpen}
              onClose={() => setIsConfirmModalOpen(false)}
              title="Final Confirmation"
          >
              <div className="text-center">
                  <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p className="text-lg text-gray-600 my-4">Are you sure you want to submit your ballot? This action is final and irreversible.</p>
                  {isOffline && <p className="text-yellow-600 mt-2 p-2 bg-yellow-100 rounded-md font-semibold">You are currently offline. Please reconnect to the internet to submit your vote.</p>}
                  <div className="flex justify-center space-x-4 mt-6">
                      <Button variant="secondary" onClick={() => setIsConfirmModalOpen(false)}>No, Go Back</Button>
                      <Button variant="danger" onClick={handleSubmit} disabled={isOffline || isSubmitting}>
                         {isSubmitting ? <Spinner /> : 'Yes, Submit Now'}
                      </Button>
                  </div>
              </div>
          </Modal>
      </div>
    </>
  );
};

export default VotingPage;