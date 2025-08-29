import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Brain, 
  Target,
  Play,
  Clock,
  Star,
  CheckCircle
} from "lucide-react";

interface LearningModule {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  progress: number;
  completed: boolean;
  topics: string[];
  icon: any;
}

export default function Education() {
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const { data: tips = [], isLoading: tipsLoading } = useQuery<any[]>({
    queryKey: [`/api/tips?level=${selectedLevel}`],
  });

  const learningModules: LearningModule[] = [
    {
      id: 'risk-basics',
      title: 'Risk Management Fundamentals',
      description: 'Learn the essential principles of managing risk in trading, including position sizing and stop losses.',
      level: 'beginner',
      duration: '45 min',
      progress: 75,
      completed: false,
      topics: ['Position Sizing', 'Stop Losses', 'Risk-Reward Ratios', 'Portfolio Allocation'],
      icon: Shield,
    },
    {
      id: 'technical-analysis',
      title: 'Technical Analysis Basics',
      description: 'Master chart patterns, indicators, and technical analysis tools for better trade entries.',
      level: 'beginner',
      duration: '60 min',
      progress: 0,
      completed: false,
      topics: ['Chart Patterns', 'Support & Resistance', 'Moving Averages', 'Volume Analysis'],
      icon: TrendingUp,
    },
    {
      id: 'trading-psychology',
      title: 'Trading Psychology',
      description: 'Develop the mental strategies and discipline needed for consistent trading success.',
      level: 'beginner',
      duration: '40 min',
      progress: 100,
      completed: true,
      topics: ['Emotional Control', 'Discipline', 'Fear & Greed', 'Trading Plan'],
      icon: Brain,
    },
    {
      id: 'advanced-strategies',
      title: 'Advanced Trading Strategies',
      description: 'Explore sophisticated trading approaches including momentum and mean reversion strategies.',
      level: 'intermediate',
      duration: '90 min',
      progress: 20,
      completed: false,
      topics: ['Momentum Trading', 'Mean Reversion', 'Swing Trading', 'Day Trading'],
      icon: Target,
    },
    {
      id: 'portfolio-management',
      title: 'Portfolio Management',
      description: 'Learn how to construct and manage a diversified trading portfolio effectively.',
      level: 'intermediate',
      duration: '75 min',
      progress: 0,
      completed: false,
      topics: ['Diversification', 'Correlation', 'Asset Allocation', 'Rebalancing'],
      icon: BookOpen,
    },
    {
      id: 'algorithmic-trading',
      title: 'Algorithmic Trading Concepts',
      description: 'Introduction to systematic trading and algorithmic strategies for advanced traders.',
      level: 'advanced',
      duration: '120 min',
      progress: 0,
      completed: false,
      topics: ['Backtesting', 'Strategy Development', 'Automation', 'Performance Metrics'],
      icon: GraduationCap,
    },
  ];

  const filteredModules = learningModules.filter(module => module.level === selectedLevel);

  const tradingConcepts = [
    {
      title: 'Bull Market',
      description: 'A market condition where prices are rising or expected to rise.',
      category: 'Market Conditions',
    },
    {
      title: 'Bear Market',
      description: 'A market condition where prices are falling or expected to fall.',
      category: 'Market Conditions',
    },
    {
      title: 'Support Level',
      description: 'A price level where buying pressure prevents further decline.',
      category: 'Technical Analysis',
    },
    {
      title: 'Resistance Level',
      description: 'A price level where selling pressure prevents further rise.',
      category: 'Technical Analysis',
    },
    {
      title: 'Market Cap',
      description: 'The total value of a company\'s shares in the stock market.',
      category: 'Fundamentals',
    },
    {
      title: 'Volatility',
      description: 'The degree of variation in trading price over time.',
      category: 'Risk Management',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header title="Education" subtitle="Learn and improve your trading skills" />
      <main className="flex-1 overflow-y-auto p-6">
  {/* Recommended learning from CMS */}
  <CMSRecommendations />
        
        <Tabs defaultValue="courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="courses" data-testid="tab-courses">Learning Modules</TabsTrigger>
            <TabsTrigger value="concepts" data-testid="tab-concepts">Trading Concepts</TabsTrigger>
            <TabsTrigger value="tips" data-testid="tab-tips">AI Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {/* Level Filter */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900" data-testid="level-filter-title">
                    Select Your Level
                  </h3>
                  <div className="flex space-x-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                      <Button
                        key={level}
                        variant={selectedLevel === level ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLevel(level)}
                        className={selectedLevel === level ? "bg-primary text-white" : ""}
                        data-testid={`level-${level}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Learning Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg" data-testid={`module-title-${index}`}>
                              {module.title}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={`text-xs ${getLevelColor(module.level)}`}>
                                {module.level}
                              </Badge>
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {module.duration}
                              </span>
                            </div>
                          </div>
                        </div>
                        {module.completed && (
                          <CheckCircle className="w-6 h-6 text-success" data-testid={`module-completed-${index}`} />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4" data-testid={`module-description-${index}`}>
                        {module.description}
                      </p>
                      
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-600">Progress</span>
                          <span className="text-xs text-gray-900" data-testid={`module-progress-${index}`}>
                            {module.progress}%
                          </span>
                        </div>
                        <Progress value={module.progress} className="h-2" />
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Topics Covered:</h4>
                        <div className="flex flex-wrap gap-1">
                          {module.topics.map((topic, topicIndex) => (
                            <Badge 
                              key={topicIndex} 
                              variant="secondary" 
                              className="text-xs"
                              data-testid={`module-topic-${index}-${topicIndex}`}
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-primary text-white hover:bg-blue-700"
                        disabled={module.completed}
                        data-testid={`module-start-${index}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {module.completed ? 'Completed' : module.progress > 0 ? 'Continue' : 'Start Module'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="concepts">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle data-testid="concepts-title">Trading Concepts Dictionary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tradingConcepts.map((concept, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      data-testid={`concept-${index}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900" data-testid={`concept-title-${index}`}>
                          {concept.title}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {concept.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600" data-testid={`concept-description-${index}`}>
                        {concept.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tips">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-100">
              <CardHeader>
                <CardTitle className="flex items-center" data-testid="ai-tips-title">
                  <Star className="w-5 h-5 mr-2 text-primary" />
                  AI-Generated Trading Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tipsLoading ? (
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                ) : tips && tips.length > 0 ? (
                  <div className="space-y-4" data-testid="ai-tips-list">
                    {tips.map((tip: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-start bg-gray-50 p-4 rounded-lg"
                        data-testid={`ai-tip-${index}`}
                      >
                        <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium mr-4 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500" data-testid="no-ai-tips">
                      AI trading tips are currently unavailable. Please try again later.
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-4">Recommended Learning Path</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        1
                      </div>
                      <span>Complete Risk Management Fundamentals</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        2
                      </div>
                      <span>Master Technical Analysis Basics</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        3
                      </div>
                      <span>Study Trading Psychology</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                        4
                      </div>
                      <span>Practice with Paper Trading</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CMSRecommendations() {
  const { data } = useQuery<any>({ queryKey: ["/api/cms/education"] });
  const recs = data?.recommendations || [];
  if (!recs.length) return null;
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
      <CardHeader>
        <CardTitle>Recommended Learning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recs.map((rec: any) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all hover:-translate-y-0.5">
              <h4 className="font-medium text-gray-900 mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600">{rec.body}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
