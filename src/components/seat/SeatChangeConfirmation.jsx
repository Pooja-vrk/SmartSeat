// Seat change confirmation component
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Badge } from '../common';
import { 
  ArrowRight, 
  Armchair, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react';

const SeatChangeConfirmation = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentSeat, 
  newSeat,
  seatDetails
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Seat Change"
      size="md"
    >
      <ModalBody>
        <div className="space-y-4">
          {/* Current Seat */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
              <Armchair className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Current Seat</p>
                <p className="text-xl font-bold text-gray-900">{currentSeat}</p>
              </div>
            </div>
            <Badge variant="default">Current</Badge>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-primary-600" />
          </div>

          {/* New Seat */}
          <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
            <div className="flex items-center space-x-3">
              <Armchair className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-primary-700">New Seat</p>
                <p className="text-xl font-bold text-primary-600">{newSeat}</p>
              </div>
            </div>
            <Badge variant="success">New</Badge>
          </div>

          {/* Seat Details */}
          {seatDetails && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Seat Details</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium">{seatDetails.seatType || 'Standard'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">₹{seatDetails.price}</span>
                </div>
                {seatDetails.windowSide !== undefined && (
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-medium">{seatDetails.windowSide ? 'Window' : 'Aisle'}</span>
                  </div>
                )}
                {seatDetails.matchScore && (
                  <div className="flex justify-between">
                    <span>Match Score:</span>
                    <span className="font-medium">{seatDetails.matchScore}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notice */}
          <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800">
              This action will change your seat assignment. Please confirm you want to proceed with this change.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start space-x-2 p-3 bg-gray-100 rounded-lg border border-gray-200">
            <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              Your current seat will become available for other passengers immediately after confirmation.
            </p>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm} icon={CheckCircle}>
          Confirm Change
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default SeatChangeConfirmation;
