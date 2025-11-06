import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LogOut, Moon, Sun, Sparkles, Loader2, BookOpen, Map as MapIcon } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, getAuthHeaders } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [loading, setLoading] = useState(false);

  const handleGenerateMap = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(
        `${API}/generate-map`,
        { topic, level },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('Learning map generated!');
        // Navigate to map viewer with the generated data
        navigate('/map/new', { state: { mapData: response.data.data, topic, level } });
      }
    } catch (error) {
      console.error('Error generating map:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate learning map');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Wisdom Graph</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-slate-600 dark:text-slate-300 hidden sm:inline">
              Welcome, {user?.name}!
            </span>
            <Button
              data-testid="saved-maps-btn"
              variant="outline"
              onClick={() => navigate('/saved-maps')}
              className="hidden sm:flex"
            >
              <MapIcon className="h-4 w-4 mr-2" />
              Saved Maps
            </Button>
            <Button
              data-testid="theme-toggle-btn"
              variant="outline"
              size="icon"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button
              data-testid="logout-btn"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-2">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl mb-2">Generate Learning Map</CardTitle>
              <CardDescription className="text-base">
                Enter any topic you want to learn and we'll create an interactive learning roadmap for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateMap} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-base">Topic</Label>
                  <Input
                    data-testid="topic-input"
                    id="topic"
                    type="text"
                    placeholder="e.g., Web Development, Machine Learning, Gardening..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-base">Learning Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger data-testid="level-select" id="level" className="text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem data-testid="level-beginner" value="Beginner">Beginner</SelectItem>
                      <SelectItem data-testid="level-intermediate" value="Intermediate">Intermediate</SelectItem>
                      <SelectItem data-testid="level-advanced" value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {level === 'Beginner' && 'Focus on fundamentals and getting started'}
                    {level === 'Intermediate' && 'Deeper understanding and practical applications'}
                    {level === 'Advanced' && 'Expert topics and cutting-edge concepts'}
                  </p>
                </div>

                <Button
                  data-testid="generate-map-btn"
                  type="submit"
                  className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating your learning map...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Learning Map
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Examples to try:</h4>
                <div className="flex flex-wrap gap-2">
                  {['Web Development', 'Machine Learning', 'Digital Marketing', 'Gardening', 'Photography'].map((example) => (
                    <button
                      key={example}
                      data-testid={`example-${example.toLowerCase().replace(' ', '-')}`}
                      onClick={() => setTopic(example)}
                      className="px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
