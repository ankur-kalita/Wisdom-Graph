import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Trash2, Eye, Download, Moon, Sun, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SavedMaps = () => {
  const navigate = useNavigate();
  const { getAuthHeaders } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMaps();
  }, []);

  const loadMaps = async () => {
    try {
      const response = await axios.get(`${API}/maps`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        setMaps(response.data.maps);
      }
    } catch (error) {
      console.error('Error loading maps:', error);
      toast.error('Failed to load saved maps');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mapId) => {
    if (!window.confirm('Are you sure you want to delete this learning map?')) {
      return;
    }

    try {
      const response = await axios.delete(`${API}/maps/${mapId}`, {
        headers: getAuthHeaders(),
      });

      if (response.data.success) {
        toast.success('Learning map deleted');
        setMaps(maps.filter((map) => map.id !== mapId));
      }
    } catch (error) {
      console.error('Error deleting map:', error);
      toast.error('Failed to delete learning map');
    }
  };

  const handleExport = async (mapId, topic) => {
    try {
      const response = await axios.get(`${API}/maps/${mapId}/export`, {
        headers: getAuthHeaders(),
      });

      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learning-map-${topic.replace(/\s+/g, '-').toLowerCase()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast.success('Map exported successfully!');
    } catch (error) {
      console.error('Error exporting map:', error);
      toast.error('Failed to export map');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              data-testid="back-to-dashboard-btn"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <Button
            data-testid="theme-toggle-btn"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Saved Learning Maps
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Access your previously created learning maps
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : maps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  You haven't saved any learning maps yet.
                </p>
                <Button
                  data-testid="create-first-map-btn"
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create Your First Map
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {maps.map((map) => (
                <Card
                  key={map.id}
                  className="hover:shadow-xl transition-all border-2"
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{map.topic}</CardTitle>
                    <CardDescription>
                      <span className="inline-block px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                        {map.level}
                      </span>
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(map.created_at).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {map.nodes?.length || 0} nodes • {map.edges?.length || 0} connections
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        data-testid={`view-map-${map.id}-btn`}
                        size="sm"
                        onClick={() => navigate(`/map/${map.id}`)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        data-testid={`export-map-${map.id}-btn`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(map.id, map.topic)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        data-testid={`delete-map-${map.id}-btn`}
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(map.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedMaps;
