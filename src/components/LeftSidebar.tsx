import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/store/useStore';
import { useSound } from '@/hooks/useSound';
import { trendingConcepts, basePredictiveInsights, generateRandomInsights } from '@/lib/mockData.ts';
import { 
  TrendingUp, 
  Target, 
  Eye, 
  Zap, 
  BarChart3, 
  Brain, 
  Sparkles,
  ArrowUp,
  ArrowDown,
  Minus,
  Users,
  MousePointer,
  Layers,
  Activity
} from 'lucide-react';
import StrategicOracle from './StrategicOracle';

export const LeftSidebar = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'trends'>('analytics');
  const { 
    isGeneratingStrategy, 
    setIsGeneratingStrategy, 
    predictiveInsights, 
    setPredictiveInsights,
    setPromptText,
    promptText 
  } = useStore();
  const { playSound } = useSound();

  // Initialize with base insights if empty
  const insights = predictiveInsights.length > 0 ? predictiveInsights : basePredictiveInsights;

  const handleGenerateStrategy = async () => {
    playSound('generative');
    setIsGeneratingStrategy(true);

    // Simulate API call (2s as required by the mandate)
    setTimeout(() => {
      const newInsights = generateRandomInsights();
      setPredictiveInsights(newInsights);
      setIsGeneratingStrategy(false);
      playSound('success');
    }, 2000);
  };

  const handleTrendSuggestion = (suggestion: string) => {
  playSound('toggle');
    if (promptText.trim()) {
      setPromptText(promptText + '. ' + suggestion);
    } else {
      setPromptText(suggestion);
    }
  };

  return (
    <div className="w-80 bg-card/50 backdrop-blur-xl border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border/30">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-lg font-bold bg-gradient-holographic bg-clip-text text-transparent mb-1">
            Strategic Oracle
          </h2>
          <p className="text-sm text-muted-foreground">AI-Powered Intelligence Hub</p>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as 'analytics' | 'trends');
          playSound('toggle');
        }}>
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 m-4">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 text-xs">
              <BarChart3 className="w-3 h-3 mr-1" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="trends" className="data-[state=active]:bg-primary/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-4 mt-4 px-4 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="analytics-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Predictive Analytics */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent" />
                    <h3 className="font-semibold text-sm">Predictive Analytics</h3>
                  </div>
                  
                  <motion.div 
                    className="space-y-3"
                    animate={isGeneratingStrategy ? { opacity: 0.6 } : { opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {insights.map((insight) => (
                      <motion.div
                        key={insight.id}
                        layout
                        className="bg-card/30 p-3 rounded-lg border border-border/30"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">{insight.metric}</span>
                          <div className="flex items-center gap-1">
                            {insight.change === 'up' ? (
                              <ArrowUp className="w-3 h-3 text-green-400" />
                            ) : insight.change === 'down' ? (
                              <ArrowDown className="w-3 h-3 text-red-400" />
                            ) : (
                              <Minus className="w-3 h-3 text-yellow-400" />
                            )}
                            <span className="text-xs text-muted-foreground">{insight.confidence}</span>
                          </div>
                        </div>
                        <div className="text-lg font-bold text-accent">{insight.predicted}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Audience Insights */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Audience Insights</h3>
                  </div>
                  
                  <div className="bg-card/30 p-3 rounded-lg border border-border/30 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Primary Demo:</span>
                      <span className="font-medium">18-34, Tech Early Adopters</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak Hours:</span>
                      <span className="font-medium">7-9 PM EST</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Top Platform:</span>
                      <span className="font-medium">Horizon Worlds</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4 mt-4 px-4 flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key="trends-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Metaverse Trend Radar */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Metaverse Trend Radar</h3>
                  </div>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {trendingConcepts.map((concept) => (
                      <motion.div key={concept.id} whileHover={{ scale: 1.02 }}>
                        <button
                          onClick={() => {
                            handleTrendSuggestion(concept.promptSuggestion);
                            // sound
                            playSound('toggle');
                          }}
                          className="w-full text-left bg-card/30 p-3 rounded-lg border border-border/30"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium">{concept.title}</h4>
                            <Badge variant={concept.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {concept.growth}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                            {concept.description}
                          </p>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Engagement: {concept.engagement}</span>
                            <span className="text-primary font-medium">Click to apply →</span>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* AI Recommendations */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-accent" />
                    <h3 className="font-semibold text-sm">AI Recommendations</h3>
                  </div>
                  
                  <div className="bg-gradient-subtle/30 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Strategic Insight</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Based on current trends, consider incorporating 
                          <span className="text-accent font-medium"> interactive holographic elements </span>
                          and <span className="text-accent font-medium">bio-inspired aesthetics</span> 
                          to maximize engagement in VR/AR environments.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency Insights from Strategic Oracle */}
                <div className="space-y-3">
                  <StrategicOracle />
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>

      {/* Generate Strategy Button */}
      <div className="p-4 border-t border-border/30">
        <Button 
          onClick={handleGenerateStrategy}
          disabled={isGeneratingStrategy}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
        >
          <motion.div
            animate={isGeneratingStrategy ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: isGeneratingStrategy ? Infinity : 0 }}
            className="flex items-center mr-2"
          >
            {isGeneratingStrategy ? (
              <svg className="animate-spin w-4 h-4 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/></svg>
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
          </motion.div>
          {isGeneratingStrategy ? 'Generando...' : 'Generate Strategy'}
        </Button>
      </div>
    </div>
  );
};