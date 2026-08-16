// Seat recommendation component
import { Card, CardHeader, CardBody, Button, Badge } from '../common';
import { 
  Star, 
  Armchair, 
  Check, 
  Info,
  TrendingUp,
  MapPin,
  Zap
} from 'lucide-react';

const SeatRecommendation = ({ 
  recommendations, 
  onSelectRecommendation,
  currentSeat
}) => {
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMatchScoreBadge = (score) => {
    if (score >= 90) return 'success';
    if (score >= 80) return 'info';
    if (score >= 70) return 'warning';
    return 'default';
  };

  const renderReasonIcon = (reason) => {
    const lowerReason = reason.toLowerCase();
    
    if (lowerReason.includes('empty') || lowerReason.includes('available')) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    if (lowerReason.includes('front') || lowerReason.includes('section')) {
      return <MapPin className="w-4 h-4 text-blue-600" />;
    }
    if (lowerReason.includes('accessibility') || lowerReason.includes('legroom')) {
      return <Zap className="w-4 h-4 text-yellow-600" />;
    }
    return <Info className="w-4 h-4 text-gray-600" />;
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-gray-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No seat recommendations available at this time</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommended Seats</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Based on your preferences, here are the best alternative seats
        </p>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.seatNumber}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === 0 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-200 bg-white hover:border-primary-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100">
                    <Armchair className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {recommendation.seatNumber}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className={`text-sm font-semibold ${getMatchScoreColor(recommendation.matchScore)}`}>
                        {recommendation.matchScore}% match
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={getMatchScoreBadge(recommendation.matchScore)}>
                  {recommendation.matchScore}%
                </Badge>
              </div>

              {/* Reasons */}
              <div className="space-y-2 mb-4">
                {recommendation.reasons.map((reason, reasonIndex) => (
                  <div key={reasonIndex} className="flex items-center space-x-2 text-sm">
                    {renderReasonIcon(reason)}
                    <span className="text-gray-700">{reason}</span>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-4">
                  {recommendation.windowSide && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>Window</span>
                    </span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Info className="w-4 h-4" />
                    <span>Row {recommendation.distanceFromFront}</span>
                  </span>
                </div>
                <span className="font-medium text-primary-600">
                  ₹{recommendation.price}
                </span>
              </div>

              {/* Action Button */}
              <Button
                variant={index === 0 ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onSelectRecommendation(recommendation)}
                className="w-full"
              >
                {index === 0 ? 'Select Best Match' : 'Select Seat'}
              </Button>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Recommendations are based on your SmartSeat preferences. Seat availability will be confirmed before final change.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SeatRecommendation;
