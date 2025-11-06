import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Moon, Sun, Sparkles, Brain, Map, Zap, Book, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const LandingPage = () => {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await register(registerName, registerEmail, registerPassword);
    
    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          data-testid="theme-toggle-btn"
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-2"
        >
          {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl">
                <Brain className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-slate-900 dark:text-white">
              AI Learning Map
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8">
              Transform any topic into a structured, interactive learning journey.
              Powered by AI to help you explore complex subjects visually and intuitively.
            </p>
            <Button
              data-testid="get-started-btn"
              size="lg"
              onClick={() => setShowAuth(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 w-fit mb-4">
                <Map className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Interactive Maps</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Visualize learning paths with interactive node-based maps that adapt to your exploration.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 w-fit mb-4">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">AI-Powered</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Generate comprehensive learning roadmaps instantly using advanced AI technology.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 w-fit mb-4">
                <Book className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Learning Resources</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Get curated resources, articles, and guides for each topic in your learning journey.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 w-fit mb-4">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Level Filtering</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Adjust complexity with Beginner, Intermediate, or Advanced level filters.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Deep Exploration</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Expand any node to reveal subtopics and dive deeper into specific areas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="p-3 rounded-xl bg-pink-100 dark:bg-pink-900/30 w-fit mb-4">
                <Sparkles className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Save & Export</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Save your learning maps and export them as JSON for future reference.
              </p>
            </div>
          </div>

          {/* Auth Modal */}
          {showAuth && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <CardHeader className="relative">
                  <button
                    data-testid="close-auth-modal-btn"
                    onClick={() => setShowAuth(false)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                  <CardTitle>Welcome to AI Learning Map</CardTitle>
                  <CardDescription>Create an account or sign in to get started</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger data-testid="login-tab" value="login">Login</TabsTrigger>
                      <TabsTrigger data-testid="register-tab" value="register">Register</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="login">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email</Label>
                          <Input
                            data-testid="login-email-input"
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <Input
                            data-testid="login-password-input"
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button
                          data-testid="login-submit-btn"
                          type="submit"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>
                    
                    <TabsContent value="register">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-name">Name</Label>
                          <Input
                            data-testid="register-name-input"
                            id="register-name"
                            type="text"
                            placeholder="John Doe"
                            value={registerName}
                            onChange={(e) => setRegisterName(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <Input
                            data-testid="register-email-input"
                            id="register-email"
                            type="email"
                            placeholder="you@example.com"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <Input
                            data-testid="register-password-input"
                            id="register-password"
                            type="password"
                            placeholder="••••••••"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                        <Button
                          data-testid="register-submit-btn"
                          type="submit"
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
