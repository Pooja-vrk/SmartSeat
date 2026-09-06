// Payment form component — SmartSeat
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../common';
import {
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// UPI provider options
const UPI_PROVIDERS = [
  { value: '', label: 'Select UPI App' },
  { value: 'gpay',    label: 'Google Pay'  },
  { value: 'phonepe', label: 'PhonePe'     },
  { value: 'paytm',   label: 'Paytm'       },
  { value: 'bhim',    label: 'BHIM'        },
  { value: 'other',   label: 'Other UPI'   },
];

// Very basic UPI ID format: anything@word
const UPI_REGEX = /^[a-zA-Z0-9.\-_+]+@[a-zA-Z0-9]+$/;

const PaymentForm = ({ amount, onPaymentComplete, onCancel }) => {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [processing, setProcessing]       = useState(false);
  const [validationError, setValidationError] = useState('');

  const [formData, setFormData] = useState({
    // UPI
    upiProvider: '',
    upiId: '',
    // Card
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvv: '',
    // Net Banking
    bankName: '',
    // Wallet
    walletType: '',
  });

  const paymentMethods = [
    { id: 'upi',        label: 'UPI',               icon: Smartphone, description: 'Pay using any UPI app'        },
    { id: 'card',       label: 'Credit/Debit Card',  icon: CreditCard, description: 'Visa, Mastercard, RuPay'      },
    { id: 'netbanking', label: 'Net Banking',         icon: Building2,  description: 'All major banks supported'   },
    { id: 'wallet',     label: 'Wallet',              icon: Wallet,     description: 'Paytm, PhonePe, Amazon Pay'  },
  ];

  const handleInputChange = (e) => {
    setValidationError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Per-method validation ───────────────────────────────

  const validate = () => {
    if (paymentMethod === 'upi') {
      if (!formData.upiProvider) {
        return 'Please select a UPI app.';
      }
      if (!formData.upiId.trim()) {
        return 'Please enter your UPI ID (e.g. name@upi).';
      }
      if (!UPI_REGEX.test(formData.upiId.trim())) {
        return 'UPI ID format is invalid. Example: name@okicici';
      }
    }
    if (paymentMethod === 'card') {
      const digits = formData.cardNumber.replace(/\s/g, '');
      if (!digits || digits.length < 12) return 'Please enter a valid card number.';
      if (!formData.cardName.trim())     return 'Please enter the cardholder name.';
      if (!formData.cardExpiry.trim())   return 'Please enter the card expiry date.';
      if (!formData.cardCvv.trim())      return 'Please enter the CVV.';
    }
    if (paymentMethod === 'netbanking') {
      if (!formData.bankName) return 'Please select your bank.';
    }
    if (paymentMethod === 'wallet') {
      if (!formData.walletType) return 'Please select a wallet.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    setProcessing(true);

    // Simulated payment — 2 s delay (no real gateway)
    setTimeout(() => {
      setProcessing(false);
      onPaymentComplete({
        method: paymentMethod,
        upiProvider: paymentMethod === 'upi' ? formData.upiProvider : undefined,
        amount,
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  };

  // ─── UPI provider label helper ───────────────────────────

  const upiPlaceholder = () => {
    switch (formData.upiProvider) {
      case 'gpay':    return 'mobilenumber@okicici';
      case 'phonepe': return 'mobilenumber@ybl';
      case 'paytm':   return 'mobilenumber@paytm';
      case 'bhim':    return 'mobilenumber@upi';
      default:        return 'yourname@upi';
    }
  };

  // ─── Per-method form fields ──────────────────────────────

  const renderPaymentMethodForm = () => {
    switch (paymentMethod) {

      case 'upi':
        return (
          <div className="space-y-4">
            {/* Step 1 — provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                UPI App <span className="text-red-500">*</span>
              </label>
              <select
                name="upiProvider"
                value={formData.upiProvider}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                {UPI_PROVIDERS.map(p => (
                  <option key={p.value} value={p.value} disabled={p.value === ''}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2 — UPI ID (shown after provider chosen) */}
            {formData.upiProvider && (
              <>
                <Input
                  label="UPI ID"
                  placeholder={upiPlaceholder()}
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  required
                />
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    You will receive a payment request on{' '}
                    <strong>{UPI_PROVIDERS.find(p => p.value === formData.upiProvider)?.label || 'your UPI app'}</strong>.
                    Please approve it to complete the payment.
                  </p>
                </div>
              </>
            )}
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
                { value: 'sbi',    label: 'State Bank of India'    },
                { value: 'hdfc',   label: 'HDFC Bank'              },
                { value: 'icici',  label: 'ICICI Bank'             },
                { value: 'axis',   label: 'Axis Bank'              },
                { value: 'kotak',  label: 'Kotak Mahindra Bank'    },
                { value: 'pnb',    label: 'Punjab National Bank'   },
                { value: 'bob',    label: 'Bank of Baroda'         },
                { value: 'other',  label: 'Other Bank'             },
              ]}
            />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You will be redirected to your bank's secure payment gateway.
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
                { value: 'paytm',     label: 'Paytm'       },
                { value: 'phonepe',   label: 'PhonePe'     },
                { value: 'amazonpay', label: 'Amazon Pay'  },
                { value: 'gpay',      label: 'Google Pay'  },
                { value: 'mobikwik',  label: 'MobiKwik'    },
              ]}
            />
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                You will be redirected to your wallet's secure payment page.
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
        <form onSubmit={handleSubmit} noValidate>

          {/* Amount — backend GST-inclusive total */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg text-white text-center">
            <p className="text-sm text-primary-100 mb-1">Total Amount</p>
            <p className="text-3xl font-bold">
              ₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-primary-200 mt-1">Includes GST</p>
          </div>

          {/* Method selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(method.id);
                      setValidationError('');
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      paymentMethod === method.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-primary-600' : 'text-gray-500'}`} />
                      <div>
                        <p className={`font-medium ${paymentMethod === method.id ? 'text-primary-900' : 'text-gray-900'}`}>
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

          {/* Per-method fields */}
          <div className="mb-6">
            {renderPaymentMethodForm()}
          </div>

          {/* Validation error */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}

          {/* Security notice */}
          <div className="mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <p className="text-xs text-gray-600">
                Your payment is secured with 256-bit SSL encryption
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={processing}
              className="flex-1"
              icon={CheckCircle}
            >
              {processing
                ? 'Processing...'
                : `Pay ₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </Button>
          </div>

        </form>
      </CardBody>
    </Card>
  );
};

export default PaymentForm;
