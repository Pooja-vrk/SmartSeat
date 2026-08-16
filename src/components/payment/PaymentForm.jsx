// Payment form component
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../common';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Lock,
  CheckCircle
} from 'lucide-react';

const PaymentForm = ({ 
  amount, 
  onPaymentComplete, 
  onCancel 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    upiId: '',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    bankName: '',
    walletType: ''
  });

  const paymentMethods = [
    { 
      id: 'upi', 
      label: 'UPI', 
      icon: Smartphone,
      description: 'Pay using any UPI app'
    },
    { 
      id: 'card', 
      label: 'Credit/Debit Card', 
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay'
    },
    { 
      id: 'netbanking', 
      label: 'Net Banking', 
      icon: Building2,
      description: 'All major banks supported'
    },
    { 
      id: 'wallet', 
      label: 'Wallet', 
      icon: Wallet,
      description: 'Paytm, PhonePe, Amazon Pay'
    }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete({
        method: paymentMethod,
        amount,
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  };

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div className="space-y-4">
            <Input
              label="UPI ID"
              placeholder="yourname@upi"
              name="upiId"
              value={formData.upiId}
              onChange={handleInputChange}
              required
            />
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You will receive a payment request on your UPI app. Please approve it to complete the payment.
              </p>
            </div>
          </div>
        );

      case 'card':
        return (
          <div className="space-y-4">
            <Input
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              required
              maxLength={19}
            />
            <Input
              label="Cardholder Name"
              placeholder="Name on card"
              name="cardName"
              value={formData.cardName}
              onChange={handleInputChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Expiry Date"
                placeholder="MM/YY"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={handleInputChange}
                required
                maxLength={5}
              />
              <Input
                label="CVV"
                placeholder="123"
                name="cardCvv"
                value={formData.cardCvv}
                onChange={handleInputChange}
                required
                maxLength={4}
                showPasswordToggle
              />
            </div>
          </div>
        );

      case 'netbanking':
        return (
          <div className="space-y-4">
            <Select
              label="Select Bank"
              placeholder="Choose your bank"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              required
              options={[
                { value: 'sbi', label: 'State Bank of India' },
                { value: 'hdfc', label: 'HDFC Bank' },
                { value: 'icici', label: 'ICICI Bank' },
                { value: 'axis', label: 'Axis Bank' },
                { value: 'kotak', label: 'Kotak Mahindra Bank' },
                { value: 'pnb', label: 'Punjab National Bank' },
                { value: 'bob', label: 'Bank of Baroda' },
                { value: 'other', label: 'Other Bank' }
              ]}
            />
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You will be redirected to your bank's secure payment gateway to complete the transaction.
              </p>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <Select
              label="Select Wallet"
              placeholder="Choose your wallet"
              name="walletType"
              value={formData.walletType}
              onChange={handleInputChange}
              required
              options={[
                { value: 'paytm', label: 'Paytm' },
                { value: 'phonepe', label: 'PhonePe' },
                { value: 'amazonpay', label: 'Amazon Pay' },
                { value: 'gpay', label: 'Google Pay' },
                { value: 'mobikwik', label: 'MobiKwik' }
              ]}
            />
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You will be redirected to your wallet's secure payment page to complete the transaction.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
        <p className="text-sm text-gray-600">Complete your payment to confirm booking</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          {/* Amount Display */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white text-center">
            <p className="text-sm text-primary-100 mb-1">Total Amount</p>
            <p className="text-3xl font-bold">₹{amount}</p>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${
                        paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'
                      }`} />
                      <div>
                        <p className={`font-medium ${
                          paymentMethod === method.id ? 'text-primary-900' : 'text-gray-900'
                        }`}>
                          {method.label}
                        </p>
                        <p className="text-xs text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Form */}
          <div className="mb-6">
            {renderPaymentMethodForm()}
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={processing}
              className="flex-1"
              icon={CheckCircle}
            >
              {processing ? 'Processing...' : `Pay ₹${amount}`}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default PaymentForm;
