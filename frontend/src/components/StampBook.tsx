'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Gift, 
  HeartHandshake, 
  BarChart3, 
  Coins, 
  Lock, 
  CheckCircle2, 
  Share2, 
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge as UiBadge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export interface Badge {
  id: string;
  quest_id: string;
  title: string;
  description: string;
  badge_image_url: string;
  badge_name: string;
  is_unlocked: boolean;
  unlocked_at?: string;
  reward_points: number;
  required_pois_count: number;
  completed_pois_count: number;
  progress_percentage: number;
}

export interface WalletInfo {
  points_balance: number;
  total_earned: number;
  total_spent: number;
  rank?: number;
  rank_title?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  category: 'mobility' | 'gastronomy' | 'craft' | 'sadaqah';
  points_required: number;
  stock_quantity: number;
  image_url?: string;
  merchant_name?: string;
}

export interface SadaqahRecipient {
  id: string;
  name: string;
  description: string;
  account_name: string;
  conversion_rate: number;
  logo_url?: string;
}

export interface StampBookProps {
  userId: string;
  authToken: string;
  locale?: 'th' | 'ms' | 'en' | 'ar';
  onPointsUpdate?: (newBalance: number) => void;
}

const useWallet = (userId: string, authToken: string) => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = () => {
      setLoading(true);
      setTimeout(() => {
        setWallet({
          points_balance: 1450,
          total_earned: 2500,
          total_spent: 1050,
          rank: 2,
          rank_title: 'Explorer',
        });
        setLoading(false);
      }, 800);
    };

    fetchWallet();
    const interval = setInterval(fetchWallet, 30000);
    return () => clearInterval(interval);
  }, [userId, authToken]);

  return { wallet, loading, setWallet };
};

const useBadges = (userId: string, authToken: string) => {
  const { t } = useTranslation();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setBadges([
        {
          id: '1',
          quest_id: 'q1',
          title: t('gamification.badge_1_name', 'Heritage Explorer'),
          description: t('gamification.badge_1_desc', 'Visit 5 historical sites in Pattani.'),
          badge_image_url: '🕌',
          badge_name: t('gamification.badge_1_name', 'Heritage Explorer'),
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          reward_points: 500,
          required_pois_count: 5,
          completed_pois_count: 5,
          progress_percentage: 100
        },
        {
          id: '2',
          quest_id: 'q2',
          title: t('gamification.badge_2_name', 'Gastronomy Lover'),
          description: t('gamification.badge_2_desc', 'Try 10 certified Halal restaurants.'),
          badge_image_url: '🍲',
          badge_name: t('gamification.badge_2_name', 'Gastronomy Lover'),
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          reward_points: 1000,
          required_pois_count: 10,
          completed_pois_count: 10,
          progress_percentage: 100
        },
        {
          id: '3',
          quest_id: 'q3',
          title: t('gamification.badge_3_name', 'Artisan Friend'),
          description: t('gamification.badge_3_desc', 'Attend 3 local craft workshops.'),
          badge_image_url: '🎨',
          badge_name: t('gamification.badge_3_name', 'Artisan Friend'),
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
          reward_points: 300,
          required_pois_count: 3,
          completed_pois_count: 3,
          progress_percentage: 100
        }
      ]);
      setLoading(false);
    }, 1000);
  }, [userId, authToken, t]);

  return { badges, loading };
};

const ConfettiOverlay = ({ badge, onClose }: { badge: Badge, onClose: () => void }) => {
  const { t } = useTranslation();
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-2xl animate-spring-up text-center max-w-sm w-full mx-4 border-2 border-yellow-400">
        <h2 className="text-3xl font-bold mb-2">🎉 {t('gamification.badge_unlocked', 'Badge Unlocked!')}</h2>
        <div className="text-8xl my-6 animate-bounce">{badge.badge_image_url}</div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{badge.badge_name}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4">{badge.description}</p>
        <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-xl mb-8">
          <Coins className="w-6 h-6" />
          <span>+{badge.reward_points} pts</span>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" /> Share
          </Button>
          <Button className="flex-1" onClick={onClose}>
            {t('common.confirm', 'Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function StampBook({ userId, authToken, locale = 'en', onPointsUpdate }: StampBookProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('badges');
  const [rewardCategory, setRewardCategory] = useState<string>('all');
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(null);
  const [redeemedCode, setRedeemedCode] = useState<string | null>(null);
  
  const { wallet, loading: walletLoading, setWallet } = useWallet(userId, authToken);
  const { badges, loading: badgesLoading } = useBadges(userId, authToken);

  const [sadaqahAmount, setSadaqahAmount] = useState<number>(100);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  const isRTL = locale === 'ar';

  const recipients: SadaqahRecipient[] = [
    { id: 'r1', name: t('gamification.recipient_1_name', 'Pattani Central Mosque Fund'), description: t('gamification.recipient_1_desc', 'Support local mosque maintenance & community'), account_name: 'Pattani Central Mosque', conversion_rate: 10 },
    { id: 'r2', name: t('gamification.recipient_2_name', 'Orphan Children Fund'), description: t('gamification.recipient_2_desc', 'Provide food & education for orphans in 3 provinces'), account_name: 'Yateem Foundation', conversion_rate: 10 },
    { id: 'r3', name: t('gamification.recipient_3_name', 'Youth Education Scholarship'), description: t('gamification.recipient_3_desc', 'Help students in need pursue higher education'), account_name: 'Ilm Foundation', conversion_rate: 10 },
  ];

  const rewards: Reward[] = [
    { id: 'rw1', title: t('gamification.reward_1_title', 'Free Tuk-Tuk Ride (5km)'), description: 'Up to 5km', category: 'mobility', points_required: 500, stock_quantity: 5, merchant_name: t('gamification.reward_1_merchant', 'Pattani Transit') },
    { id: 'rw2', title: t('gamification.reward_2_title', 'Signature Nasi Kerabu Set'), description: 'Signature dish', category: 'gastronomy', points_required: 800, stock_quantity: 2, merchant_name: t('gamification.reward_2_merchant', 'Fatimah Kitchen') },
    { id: 'rw3', title: t('gamification.reward_3_title', 'Hand-painted Batik Scarf'), description: 'Hand-painted', category: 'craft', points_required: 1500, stock_quantity: 15, merchant_name: t('gamification.reward_3_merchant', 'Southern Arts') },
  ];

  const filteredRewards = rewardCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === rewardCategory);

  const handleRedeem = (reward: Reward) => {
    if (!wallet || wallet.points_balance < reward.points_required) return;
    
    setTimeout(() => {
      const newPoints = wallet.points_balance - reward.points_required;
      setWallet({ ...wallet, points_balance: newPoints });
      if (onPointsUpdate) onPointsUpdate(newPoints);
      setRedeemedCode(`REDEEM-${Math.random().toString(36).substring(7).toUpperCase()}`);
      toast({
        title: t('gamification.reward_ready', 'Reward Redeemed!'),
        description: `${reward.title}`,
      });
    }, 500);
  };

  const handleDonate = () => {
    if (!wallet || !selectedRecipient || wallet.points_balance < sadaqahAmount) return;
    
    setTimeout(() => {
      const newPoints = wallet.points_balance - sadaqahAmount;
      setWallet({ ...wallet, points_balance: newPoints });
      if (onPointsUpdate) onPointsUpdate(newPoints);
      toast({
        title: t('gamification.confirm_sadaqah', 'Donation Successful'),
        description: `${(sadaqahAmount / 10).toFixed(2)} THB`,
      });
      setSadaqahAmount(100);
      setSelectedRecipient(null);
    }, 500);
  };

  const getRankProgress = () => {
    if (!wallet) return 0;
    const pts = wallet.points_balance;
    if (pts < 500) return (pts / 500) * 100;
    if (pts < 2000) return ((pts - 500) / 1500) * 100;
    if (pts < 5000) return ((pts - 2000) / 3000) * 100;
    return 100;
  };

  const getNextRankPoints = () => {
    if (!wallet) return 0;
    const pts = wallet.points_balance;
    if (pts < 500) return 500 - pts;
    if (pts < 2000) return 2000 - pts;
    if (pts < 5000) return 5000 - pts;
    return 0;
  };

  return (
    <div className={`w-full text-slate-900 dark:text-slate-50 ${isRTL ? 'font-arabic' : 'font-sans'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {newlyUnlockedBadge && (
        <ConfettiOverlay badge={newlyUnlockedBadge} onClose={() => setNewlyUnlockedBadge(null)} />
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Wallet Overview */}
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-lg rounded-3xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
                  <Coins className="w-8 h-8 text-yellow-300" />
                </div>
                <div>
                  <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider">{t('gamification.points', 'Points Balance')}</p>
                  {walletLoading ? (
                    <Skeleton className="h-10 w-32 bg-white/30" />
                  ) : (
                    <h2 className="text-4xl font-extrabold tabular-nums">
                      {wallet?.points_balance.toLocaleString()} <span className="text-base font-medium text-emerald-100">pts</span>
                    </h2>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/3 space-y-2">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-emerald-100 text-xs">{t('gamification.balance', 'Current Rank')}</p>
                    <p className="font-bold text-lg">{t('gamification.rank_explorer', 'Halal Explorer')}</p>
                  </div>
                  <p className="text-xs text-emerald-100 font-semibold">{getNextRankPoints()} {t('gamification.pts_to_next', 'pts to next rank')}</p>
                </div>
                <Progress value={getRankProgress()} className="h-2.5 bg-black/20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="badges" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-gray-200/60 dark:border-slate-700">
            <TabsTrigger value="badges" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm">
              <Trophy className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t('gamification.badges', 'Badges')}</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm">
              <Gift className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t('gamification.redeem', 'Rewards')}</span>
            </TabsTrigger>
            <TabsTrigger value="sadaqah" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm">
              <HeartHandshake className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t('gamification.sadaqah', 'Sadaqah')}</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="rounded-xl font-bold py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white shadow-sm">
              <BarChart3 className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">{t('gamification.leaderboard', 'Rankings')}</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: BADGES */}
          <TabsContent value="badges" className="mt-6 focus-visible:outline-none">
            {badgesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1,2,3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    className={`relative rounded-3xl p-5 border transition-all duration-300 ${
                      badge.is_unlocked 
                        ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 shadow-md hover:shadow-xl'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 grayscale opacity-80'
                    }`}
                  >
                    {!badge.is_unlocked && (
                      <div className="absolute top-4 right-4 z-10 bg-black/60 p-2 rounded-full backdrop-blur-sm">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                      <div className="text-6xl my-2 transform transition-transform hover:scale-110">
                        {badge.badge_image_url}
                      </div>
                      
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100">{badge.badge_name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[2.5rem]">
                          {badge.description}
                        </p>
                      </div>

                      {badge.is_unlocked ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-extrabold bg-emerald-100 dark:bg-emerald-950 px-3.5 py-1 rounded-full text-xs border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('gamification.earned', 'Earned')}</span>
                        </div>
                      ) : (
                        <div className="w-full space-y-1.5 pt-2">
                          <div className="flex justify-between text-xs text-slate-500 font-bold">
                            <span>{t('gamification.progress', 'Progress')}</span>
                            <span>{badge.completed_pois_count}/{badge.required_pois_count}</span>
                          </div>
                          <Progress value={badge.progress_percentage} className="h-2" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 2: REWARDS */}
          <TabsContent value="rewards" className="mt-6 focus-visible:outline-none">
            {redeemedCode ? (
              <Card className="max-w-md mx-auto text-center border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2 text-xl font-bold">
                    <CheckCircle2 className="w-6 h-6" /> {t('gamification.reward_ready', 'Reward Ready!')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white p-4 rounded-2xl inline-block shadow-md">
                    <QRCodeSVG value={redeemedCode} size={180} />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{t('gamification.show_qr_merchant', 'Show this QR code to the merchant to redeem.')}</p>
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-xl text-lg font-mono font-bold tracking-widest text-emerald-900 dark:text-emerald-200">
                    {redeemedCode}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => setRedeemedCode(null)}>
                    {t('gamification.back_to_rewards', 'Back to Rewards')}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRewards.map(reward => {
                    const canAfford = wallet && wallet.points_balance >= reward.points_required;
                    return (
                      <Card key={reward.id} className="overflow-hidden flex flex-row rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
                        <div className="w-28 bg-emerald-50 dark:bg-slate-800 flex items-center justify-center text-4xl border-r border-gray-100 dark:border-slate-800">
                          {reward.category === 'gastronomy' ? '🍲' : reward.category === 'mobility' ? '🛺' : '🎨'}
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{reward.title}</h4>
                              {reward.stock_quantity < 10 && (
                                <UiBadge variant="destructive" className="text-[10px] whitespace-nowrap">
                                  {t('gamification.only_left', 'Only {{count}} left', { count: reward.stock_quantity })}
                                </UiBadge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{reward.merchant_name}</p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                              <Coins className="w-4 h-4 mr-1 text-amber-500" />
                              {reward.points_required} pts
                            </div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={!canAfford}>
                                  {t('gamification.redeem', 'Redeem')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('gamification.confirm_redemption', 'Confirm Redemption')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('gamification.confirm_spend', 'Are you sure you want to spend {{points}} points?', { points: reward.points_required })} "{reward.title}"
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-xl font-bold">{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRedeem(reward)} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">
                                    {t('gamification.confirm_redeem', 'Confirm Redeem')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 3: SADAQAH */}
          <TabsContent value="sadaqah" className="mt-6 focus-visible:outline-none">
            <Card className="rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="text-center bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-gray-100 dark:border-slate-800 p-6">
                <CardTitle className="text-3xl font-arabic text-emerald-700 dark:text-emerald-400 mb-1">تصدّق</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 font-medium text-xs md:text-sm">
                  {t('gamification.donate_desc', 'Donate your earned points to support local charity.')} <br/>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 mt-2 inline-block bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full text-xs border border-emerald-300 dark:border-emerald-800">
                    {t('gamification.rate_info', 'Rate: 100 Points = 10 THB')}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">{t('gamification.select_recipient', 'Select Recipient Fund')}</h4>
                  <div className="grid gap-3">
                    {recipients.map(recipient => (
                      <div 
                        key={recipient.id}
                        onClick={() => setSelectedRecipient(recipient.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedRecipient === recipient.id 
                            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 shadow-sm' 
                            : 'border-slate-100 dark:border-slate-800 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm">{recipient.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{recipient.description}</p>
                        </div>
                        {selectedRecipient === recipient.id && <CheckCircle2 className="text-emerald-600 w-5 h-5" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm">{t('gamification.donation_amount', 'Donation Amount')}</h4>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-700 dark:text-slate-300">
                      {t('gamification.balance', 'Balance')}: {wallet?.points_balance || 0} pts
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <Slider
                      value={[sadaqahAmount]}
                      max={wallet?.points_balance || 1000}
                      step={100}
                      min={100}
                      onValueChange={(vals) => setSadaqahAmount(vals[0])}
                      className="flex-1"
                      disabled={!wallet || wallet.points_balance < 100}
                    />
                    <span className="font-mono font-bold w-16 text-right text-emerald-600 text-base">{sadaqahAmount} pts</span>
                  </div>

                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 p-4 rounded-2xl flex justify-between items-center border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{t('gamification.cash_value', 'Equivalent Cash Value:')}</span>
                    <span className="font-extrabold text-xl text-emerald-700 dark:text-emerald-400">
                      {(sadaqahAmount / 10).toFixed(2)} THB
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3"
                      disabled={!selectedRecipient || !wallet || wallet.points_balance < sadaqahAmount}
                    >
                      <HeartHandshake className="w-4 h-4 mr-2" /> {t('gamification.donate_now', 'Donate Now')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('gamification.confirm_sadaqah', 'Confirm Sadaqah Donation')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('gamification.donate_desc', 'You are donating points to support charity.')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-bold">{t('common.cancel', 'Cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDonate} className="rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700">
                        {t('gamification.donate_now', 'Confirm Donation')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* TAB 4: LEADERBOARD */}
          <TabsContent value="leaderboard" className="mt-6 focus-visible:outline-none">
            <Card className="rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <CardTitle className="text-lg font-bold">{t('gamification.top_explorers', 'Top Halal Explorers')}</CardTitle>
                  <CardDescription className="text-xs">{t('gamification.rank_globally', 'See how you rank globally')}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full"><RefreshCw className="w-4 h-4 text-gray-500" /></Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {[
                    { id: 'u1', name: 'Ahmad S.', points: 8450, rankTitle: t('gamification.rank_legend', 'Legend') },
                    { id: 'u2', name: t('gamification.you', 'You'), points: wallet?.points_balance || 1450, rankTitle: t('gamification.rank_explorer', 'Halal Explorer'), isMe: true },
                    { id: 'u3', name: 'Fatima M.', points: 7200, rankTitle: t('gamification.rank_legend', 'Legend') },
                    { id: 'u4', name: 'Zainab T.', points: 6100, rankTitle: t('gamification.rank_legend', 'Legend') },
                    { id: 'u5', name: 'Omar K.', points: 4300, rankTitle: t('gamification.rank_ambassador', 'Ambassador') },
                  ]
                  .sort((a, b) => b.points - a.points)
                  .map((user, idx) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center p-4 transition-colors ${user.isMe ? 'bg-emerald-50/70 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <div className="w-8 font-extrabold text-slate-400 text-center text-sm">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <Avatar className="h-10 w-10 mx-4 border">
                        <AvatarFallback className={user.isMe ? 'bg-emerald-600 text-white font-bold' : 'font-bold'}>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${user.isMe ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">{user.rankTitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold tabular-nums text-sm">{user.points.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400 font-bold">pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
