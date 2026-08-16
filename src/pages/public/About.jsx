// About page
import { Card, CardHeader, CardBody } from '../../components/common';
import { 
  Shield, 
  Users, 
  Star, 
  Target,
  Bus,
  Heart,
  Award,
  Globe
} from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Shield,
      title: 'Passenger Safety',
      description: 'Your comfort and security are our top priorities with privacy-first design'
    },
    {
      icon: Users,
      title: 'Inclusive Design',
      description: 'SmartSeat works for all passengers with preference-driven features'
    },
    {
      icon: Star,
      title: 'Customer Excellence',
      description: 'Committed to providing the best travel experience possible'
    },
    {
      icon: Target,
      title: 'Innovation First',
      title: 'Continuous Innovation',
      description: ' constantly improving with cutting-edge technology'
    }
  ];

  const milestones = [
    { year: '2023', event: 'SmartSeat concept born' },
    { year: '2024', event: 'Platform development launched' },
    { year: '2024', event: 'Beta testing with 1000+ users' },
    { year: '2024', event: 'Official launch with major operators' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About SmartSeat
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Revolutionizing bus travel with intelligent seat selection and passenger-aware features
        </p>
      </div>

      {/* Mission */}
      <section className="mb-16">
        <Card className="bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200">
          <CardBody>
            <div className="text-center max-w-3xl mx-auto">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Target className="w-8 h-8 text-primary-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To transform bus travel into a comfortable, informed, and personalized experience 
                by leveraging intelligent technology that respects passenger preferences while 
                ensuring safety and privacy for all travelers.
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* What is SmartSeat */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What is SmartSeat?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SmartSeat is a modern bus-booking platform with a unique Dynamic Passenger-Aware Seating system
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="mb-4">
                Unlike traditional bus booking systems, SmartSeat goes beyond simple seat selection. 
                Our innovative platform continuously monitors your booking and provides real-time updates 
                about your travel environment.
              </p>
              <p className="mb-4">
                When you book a seat, SmartSeat keeps you informed about changes to your adjacent seats, 
                offers personalized recommendations based on your preferences, and gives you complete 
                control to make changes that enhance your travel experience.
              </p>
              <p>
                Built on the principles of privacy, inclusivity, and passenger choice, SmartSeat 
                ensures that every traveler can make informed decisions about their journey without 
                compromising their personal information or comfort.
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Core Features */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Core Features</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Bus className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Smart Selection</h3>
              </div>
              <p className="text-gray-600">
                Interactive seat maps with real-time availability and intelligent recommendations
              </p>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Real-time Awareness</h3>
              </div>
              <p className="text-gray-600">
                Get notified when your adjacent seat status changes with privacy-protected information
              </p>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Star className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Personalized Matches</h3>
              </div>
              <p className="text-gray-600">
                AI-powered seat recommendations based on your travel preferences and comfort needs
              </p>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Easy Changes</h3>
              </div>
              <p className="text-gray-600">
                Switch to better seats with one-click confirmation and availability verification
              </p>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Privacy First</h3>
              </div>
              <p className="text-gray-600">
                Your personal information is protected with granular privacy controls and secure design
              </p>
            </CardBody>
          </Card>

          <Card hover>
            <CardBody>
              <div className="flex items-center space-x-3 mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900">Inclusive Design</h3>
              </div>
              <p className="text-gray-600">
                Features designed for all passengers with preference-driven, not category-based, options
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Values */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card key={index} className="border-l-4 border-l-primary-500">
                <CardBody>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
        </div>

        <Card>
          <CardBody>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-primary-200"></div>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="relative pl-12">
                    <div className="absolute left-2 w-5 h-5 rounded-full bg-primary-600 border-4 border-white"></div>
                    <div className="flex items-start space-x-4">
                      <span className="text-2xl font-bold text-primary-600">{milestone.year}</span>
                      <p className="text-lg text-gray-700">{milestone.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Team */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A passionate team of travel enthusiasts and technology experts
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="text-center text-gray-700">
              <p className="mb-4">
                SmartSeat is built by a diverse team committed to making travel better for everyone. 
                Our combined expertise in transportation, technology, and user experience drives us 
                to create solutions that truly matter to passengers.
              </p>
              <p>
                We believe that travel should be comfortable, informed, and stress-free. That's why 
                we've dedicated ourselves to building a platform that puts passengers first.
              </p>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Contact CTA */}
      <section>
        <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
          <CardBody>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Want to Learn More?</h2>
              <p className="text-lg text-primary-100 mb-6">
                We'd love to hear from you and answer any questions about SmartSeat
              </p>
              <a href="/contact" className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                Contact Us
              </a>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};

export default About;
