// Passenger details form component
import { useState } from 'react';
import { Card, CardHeader, CardBody, Button, Input, Select } from '../common';
import { User, Mail, Phone, AlertCircle } from 'lucide-react';

const PassengerDetailsForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = {} 
}) => {
  const [formData, setFormData] = useState({
    fullName: initialData.fullName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    age: initialData.age || '',
    gender: initialData.gender || '',
    passengerCategory: initialData.passengerCategory || 'general'
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 1 || parseInt(formData.age) > 120) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <User className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-900">Passenger Details</h3>
        </div>
        <p className="text-sm text-gray-600">Please provide passenger information for the booking</p>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Full Name */}
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
              icon={User}
            />

            {/* Email */}
            <Input
              label="Email Address"
              placeholder="your.email@example.com"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              icon={Mail}
            />

            {/* Phone */}
            <Input
              label="Phone Number"
              placeholder="+91 98765 43210"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              icon={Phone}
              helperText="Include country code for international numbers"
            />

            {/* Age and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Age"
                placeholder="25"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                error={errors.age}
                required
                min={1}
                max={120}
              />

              <Select
                label="Gender"
                placeholder="Select gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={errors.gender}
                required
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not_to_say', label: 'Prefer not to say' }
                ]}
              />
            </div>

            {/* Passenger Category */}
            <Select
              label="Passenger Category (Optional)"
              placeholder="Select category"
              name="passengerCategory"
              value={formData.passengerCategory}
              onChange={handleChange}
              options={[
                { value: 'general', label: 'General' },
                { value: 'senior_citizen', label: 'Senior Citizen (60+)' },
                { value: 'student', label: 'Student' },
                { value: 'woman', label: 'Woman' },
                { value: 'person_with_disability', label: 'Person with Disability' }
              ]}
              helperText="This helps us provide better service and recommendations"
            />

            {/* Privacy Notice */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Your information is protected by our privacy policy. Passenger category is used only for service improvements and will not be shared without your consent.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default PassengerDetailsForm;
