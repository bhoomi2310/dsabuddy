import { useState } from 'react';
import { 
  Button, 
  Input, 
  Card, 
  Badge, 
  Divider, 
  IconBox,
  Spinner,
} from '@/components/common';
import { 
  Header, 
  Footer, 
  FeatureCard, 
  SocialButton, 
  FormField, 
  StatItem 
} from '@/components/layout';
import { 
  User, 
  Mail, 
  Lock, 
  Trophy, 
  Flame, 
  ChartNoAxesCombined,
  CloudSync,
  Code,
} from 'lucide-react';
import GoogleLogo from '@/assets/Google.png';

export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#101e22]">
      <Header />
      
      <div className="max-w-7xl mx-auto px-8 py-20">
        <h1 className="text-5xl font-bold text-white mb-4">Component Showcase</h1>
        <p className="text-gray-400 mb-12">
          Visual reference for all available components
        </p>

        {/* Buttons Section */}
        <Section title="Buttons">
          <div className="space-y-6">
            <ComponentGroup label="Variants">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </ComponentGroup>

            <ComponentGroup label="Sizes">
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </ComponentGroup>

            <ComponentGroup label="States">
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button loading={loading} onClick={handleLoadingDemo}>
                  {loading ? 'Loading...' : 'Click to Load'}
                </Button>
              </div>
            </ComponentGroup>
          </div>
        </Section>

        {/* Inputs Section */}
        <Section title="Inputs">
          <div className="space-y-6">
            <ComponentGroup label="With Icons">
              <div className="space-y-4 max-w-md">
                <Input
                  icon={User}
                  placeholder="Username"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                />
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Without Icon">
              <div className="max-w-md">
                <Input placeholder="Plain input field" />
              </div>
            </ComponentGroup>
          </div>
        </Section>

        {/* Cards Section */}
        <Section title="Cards">
          <ComponentGroup label="Variants">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card variant="default" className="p-6">
                <h3 className="font-bold text-lg mb-2">Default Card</h3>
                <p className="text-gray-400">Standard card style with border</p>
              </Card>

              <Card variant="dark" className="p-6">
                <h3 className="font-bold text-white text-lg mb-2">Dark Card</h3>
                <p className="text-gray-400">Dark background variant</p>
              </Card>

              <Card variant="accent" className="p-6">
                <h3 className="font-bold text-lg mb-2">Accent Card</h3>
                <p className="text-gray-600">Light accent background</p>
              </Card>

              <Card variant="highlight" className="p-6">
                <h3 className="font-bold text-white text-lg mb-2">Highlight Card</h3>
                <p className="text-white">Black background variant</p>
              </Card>
            </div>
          </ComponentGroup>

          <ComponentGroup label="Animated">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="default" animated className="p-6">
                <h3 className="font-bold text-lg mb-2">Hover Me</h3>
                <p className="text-gray-400">This card animates on hover</p>
              </Card>

              <Card variant="dark" animated className="p-6">
                <h3 className="font-bold text-white text-lg mb-2">Animated Dark</h3>
                <p className="text-gray-400">With hover animation</p>
              </Card>
            </div>
          </ComponentGroup>
        </Section>

        {/* Badges Section */}
        <Section title="Badges">
          <ComponentGroup label="All Variants">
            <div className="flex flex-wrap gap-3">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </ComponentGroup>
        </Section>

        {/* Dividers Section */}
        <Section title="Dividers">
          <div className="space-y-6">
            <ComponentGroup label="Horizontal">
              <div className="max-w-md">
                <Divider />
              </div>
            </ComponentGroup>

            <ComponentGroup label="With Text">
              <div className="max-w-md">
                <Divider text="OR" />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Vertical">
              <div className="flex items-center gap-4">
                <span className="text-white">Item 1</span>
                <Divider orientation="vertical" className="h-10" />
                <span className="text-white">Item 2</span>
                <Divider orientation="vertical" className="h-10" />
                <span className="text-white">Item 3</span>
              </div>
            </ComponentGroup>
          </div>
        </Section>

        {/* IconBox Section */}
        <Section title="Icon Boxes">
          <ComponentGroup label="Variants">
            <div className="flex flex-wrap gap-4">
              <IconBox icon={Trophy} variant="primary" />
              <IconBox icon={Flame} variant="info" />
              <IconBox icon={CloudSync} variant="success" />
              <IconBox icon={ChartNoAxesCombined} variant="warning" />
            </div>
          </ComponentGroup>
        </Section>

        {/* Spinner Section */}
        <Section title="Spinners">
          <ComponentGroup label="Sizes">
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>
          </ComponentGroup>
        </Section>

        {/* Layout Components */}
        <Section title="Layout Components">
          <div className="space-y-8">
            <ComponentGroup label="Feature Cards">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FeatureCard
                  icon={ChartNoAxesCombined}
                  iconVariant="primary"
                  title="Unified Progress"
                  description="Track all your coding progress in one place"
                />
                <FeatureCard
                  icon={Trophy}
                  iconVariant="info"
                  title="Leaderboards"
                  description="Compete with students from your college"
                />
                <FeatureCard
                  icon={Flame}
                  iconVariant="warning"
                  title="Streak System"
                  description="Build consistency with daily coding"
                />
                <FeatureCard
                  icon={CloudSync}
                  iconVariant="success"
                  title="Auto-Sync"
                  description="Automatically sync all platforms"
                />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Form Field">
              <div className="max-w-md space-y-4">
                <FormField
                  label="Username"
                  labelIcon={User}
                  placeholder="enter_username"
                  name="username"
                />
                <FormField
                  label="Email Address"
                  labelIcon={Mail}
                  type="email"
                  placeholder="enter_email"
                  name="email"
                />
                <FormField
                  label="Password"
                  labelIcon={Lock}
                  type="password"
                  placeholder="******"
                  name="password"
                />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Stat Items">
              <div className="flex flex-wrap gap-8">
                <StatItem label="Track" description="daily streaks" />
                <StatItem label="Compete" description="with classmates" />
                <StatItem label="Improve" description="with analytics" />
              </div>
            </ComponentGroup>

            <ComponentGroup label="Social Button">
              <div className="max-w-md">
                <SocialButton 
                  icon={GoogleLogo}
                  text="Continue with Google"
                  onClick={() => alert('Google login clicked')}
                />
              </div>
            </ComponentGroup>
          </div>
        </Section>

        {/* Combined Examples */}
        <Section title="Combined Examples">
          <ComponentGroup label="Login Form">
            <Card variant="dark" className="max-w-md p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Sign In</h2>
              
              <div className="space-y-4">
                <Input
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                />
                <Input
                  icon={Lock}
                  type="password"
                  placeholder="Password"
                />
                
                <Button variant="accent" className="w-full">
                  Log In
                </Button>

                <Divider text="OR" />

                <SocialButton 
                  icon={GoogleLogo}
                  text="Continue with Google"
                />
              </div>
            </Card>
          </ComponentGroup>

          <ComponentGroup label="Feature Grid">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card variant="default" animated className="p-6">
                <IconBox icon={Code} variant="primary" />
                <h3 className="font-bold text-lg mt-4 mb-2">Code Daily</h3>
                <p className="text-gray-400 text-sm">
                  Build a consistent coding habit
                </p>
                <Badge variant="success" className="mt-4">Active</Badge>
              </Card>

              <Card variant="default" animated className="p-6">
                <IconBox icon={Trophy} variant="info" />
                <h3 className="font-bold text-lg mt-4 mb-2">Win Contests</h3>
                <p className="text-gray-400 text-sm">
                  Participate in coding competitions
                </p>
                <Badge variant="warning" className="mt-4">Coming Soon</Badge>
              </Card>

              <Card variant="default" animated className="p-6">
                <IconBox icon={ChartNoAxesCombined} variant="success" />
                <h3 className="font-bold text-lg mt-4 mb-2">Track Progress</h3>
                <p className="text-gray-400 text-sm">
                  Monitor your improvement over time
                </p>
                <Badge variant="primary" className="mt-4">Beta</Badge>
              </Card>
            </div>
          </ComponentGroup>
        </Section>

        <div className="mt-20 mb-10">
          <Footer />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

function ComponentGroup({ label, children }) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold text-gray-300 mb-4">{label}</h3>
      {children}
    </div>
  );
}
